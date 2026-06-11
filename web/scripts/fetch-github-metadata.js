import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ECOSYSTEM_PATH = path.resolve(__dirname, "../src/data/ecosystem.json");

// Helper function to limit concurrency of async tasks
async function limitConcurrency(tasks, limit) {
  const results = [];
  const executing = new Set();
  for (const task of tasks) {
    const p = Promise.resolve().then(() => task());
    results.push(p);
    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean, clean);
    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

// Helper to query GitHub GraphQL API
async function fetchGraphQL(owner, repo, headers, cursor = null) {
  const query = `
    query ($owner: String!, $name: String!, $before: String) {
      repository(owner: $owner, name: $name) {
        stargazerCount
        pushedAt
        isArchived
        stargazers(last: 100, before: $before) {
          edges {
            starredAt
          }
          pageInfo {
            startCursor
            hasPreviousPage
          }
        }
      }
    }
  `;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { owner, name: repo, before: cursor },
    }),
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }

  const result = await res.json();
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data?.repository || null;
}

async function fetchMetadata() {
  console.log(
    "Syncing GitHub repository metadata (total stars, pushed dates, weekly/monthly deltas)...",
  );

  if (!fs.existsSync(ECOSYSTEM_PATH)) {
    console.error(`Ecosystem file not found: ${ECOSYSTEM_PATH}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(ECOSYSTEM_PATH, "utf8");
  const parsedData = JSON.parse(rawData);

  let projects = [];
  if (Array.isArray(parsedData)) {
    projects = parsedData;
    console.log(`Loaded ${projects.length} projects from array format.`);
  } else if (parsedData && Array.isArray(parsedData.projects)) {
    projects = parsedData.projects;
    console.log(
      `Loaded ${projects.length} projects from combined object format.`,
    );
  } else {
    console.error("Invalid ecosystem.json format.");
    process.exit(1);
  }

  // Load existing metadata to fall back on if API fails/rate-limits
  const existingMetadata = {};
  for (const p of projects) {
    existingMetadata[p.name] = {
      stars: p.stars || 0,
      pushedAt: p.pushedAt || new Date(0).toISOString(),
      starsWeekly: p.starsWeekly || 0,
      starsMonthly: p.starsMonthly || 0,
      archived: p.archived || false,
    };
  }

  // Also read from legacy ecosystem-stars.json as fallback if present
  const legacyStarsPath = path.resolve(
    __dirname,
    "../src/data/ecosystem-stars.json",
  );
  if (fs.existsSync(legacyStarsPath)) {
    try {
      const legacyData = JSON.parse(fs.readFileSync(legacyStarsPath, "utf8"));
      if (legacyData && Array.isArray(legacyData.projects)) {
        for (const p of legacyData.projects) {
          if (existingMetadata[p.name]) {
            existingMetadata[p.name].stars =
              existingMetadata[p.name].stars || p.stars || 0;
            if (
              existingMetadata[p.name].pushedAt === new Date(0).toISOString() &&
              p.pushedAt
            ) {
              existingMetadata[p.name].pushedAt = p.pushedAt;
            }
            existingMetadata[p.name].starsWeekly =
              existingMetadata[p.name].starsWeekly || p.starsWeekly || 0;
            existingMetadata[p.name].starsMonthly =
              existingMetadata[p.name].starsMonthly || p.starsMonthly || 0;
          }
        }
        console.log(
          `Loaded fallback metadata from legacy ecosystem-stars.json`,
        );
      }
    } catch (err) {
      console.warn(`Could not read legacy stars file: ${err.message}`);
    }
  }

  const token = process.env.GITHUB_TOKEN;
  const headers = {
    "User-Agent": "Protobuf-Ecosystem-Fetcher/1.0",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    console.log("Using GITHUB_TOKEN for GraphQL and REST queries.");
  } else {
    console.log(
      "No GITHUB_TOKEN detected. Performing unauthenticated REST fetch (rate limit 60/hr, weekly/monthly stars will be preserved from existing file).",
    );
  }

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const tasks = projects.map((project) => async () => {
    const githubUrls = Array.isArray(project.github)
      ? project.github
      : project.github
        ? [project.github]
        : [];

    let totalStars = 0;
    let latestPushedAt = null;
    let totalStarsWeekly = 0;
    let totalStarsMonthly = 0;
    let isArchived = false;

    const fallback = existingMetadata[project.name] || {
      stars: 0,
      pushedAt: new Date(0).toISOString(),
      starsWeekly: 0,
      starsMonthly: 0,
      archived: false,
    };

    let githubReposAttempted = 0;
    let githubReposSucceeded = 0;
    let graphqlSuccess = token ? true : false;

    for (const url of githubUrls) {
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) continue;
      githubReposAttempted++;
      const owner = match[1];
      const repo = match[2];
      const repoKey = `${owner}/${repo}`;

      let stars = 0;
      let pushedAt = new Date(0).toISOString();
      let starsWeekly = 0;
      let starsMonthly = 0;
      let archived = false;
      let repoSuccess = false;
      let repoGraphqlSuccess = false;

      if (token) {
        // Use GraphQL API to get repository details and stargazers (paginated backwards)
        try {
          let cursor = null;
          let hasMore = true;
          let firstRun = true;
          let pageCount = 0;

          while (hasMore && pageCount < 10) {
            const data = await fetchGraphQL(owner, repo, headers, cursor);
            pageCount++;

            if (firstRun) {
              if (!data) {
                throw new Error("Repository not found in GraphQL response");
              }
              stars = data.stargazerCount || 0;
              pushedAt = data.pushedAt || new Date(0).toISOString();
              archived = data.isArchived || false;
              firstRun = false;
            }

            if (
              data &&
              data.stargazers &&
              Array.isArray(data.stargazers.edges)
            ) {
              const edges = data.stargazers.edges;
              for (const edge of edges) {
                const starredAt = new Date(edge.starredAt);
                if (starredAt >= oneWeekAgo) {
                  starsWeekly++;
                }
                if (starredAt >= oneMonthAgo) {
                  starsMonthly++;
                }
              }

              // If the oldest stargazer on this page was starred after oneMonthAgo,
              // there might be more stargazers in the last month on the previous page.
              if (
                edges.length > 0 &&
                new Date(edges[0].starredAt) >= oneMonthAgo &&
                data.stargazers.pageInfo?.hasPreviousPage
              ) {
                cursor = data.stargazers.pageInfo.startCursor;
                // Add a small delay between paginated requests to respect GitHub API guidelines
                await new Promise((resolve) => setTimeout(resolve, 100));
              } else {
                hasMore = false;
              }
            } else {
              hasMore = false;
            }
          }

          repoSuccess = true;
          repoGraphqlSuccess = true;
          console.log(
            `  ✓ ${repoKey}: ${stars} stars (weekly: ${starsWeekly}, monthly: ${starsMonthly}), last push: ${pushedAt}`,
          );
        } catch (err) {
          console.warn(
            `  ⚠ GraphQL query failed for ${repoKey}: ${err.message}. Trying REST fallback...`,
          );
          graphqlSuccess = false;
          // Fallback to REST API for total stars and last push
          try {
            const restHeaders = { ...headers, Authorization: `token ${token}` };
            const res = await fetch(
              `https://api.github.com/repos/${owner}/${repo}`,
              { headers: restHeaders },
            );
            if (res.ok) {
              const data = await res.json();
              stars = data.stargazers_count || 0;
              pushedAt = data.pushed_at || new Date(0).toISOString();
              archived = data.archived || false;
              repoSuccess = true;
              console.log(
                `  ✓ ${repoKey} (REST fallback): ${stars} stars, last push: ${pushedAt}`,
              );
            } else {
              throw new Error(`${res.status} ${res.statusText}`);
            }
          } catch (restErr) {
            console.warn(
              `  ⚠ REST fallback failed for ${repoKey}: ${restErr.message}.`,
            );
          }
        }
      } else {
        // Unauthenticated REST API query
        try {
          const res = await fetch(
            `https://api.github.com/repos/${owner}/${repo}`,
            { headers },
          );
          if (res.ok) {
            const data = await res.json();
            stars = data.stargazers_count || 0;
            pushedAt = data.pushed_at || new Date(0).toISOString();
            archived = data.archived || false;
            repoSuccess = true;
            console.log(
              `  ✓ ${repoKey}: ${stars} stars, last push: ${pushedAt}`,
            );
          } else {
            throw new Error(`${res.status} ${res.statusText}`);
          }
        } catch (err) {
          console.warn(
            `  ⚠ Unauthenticated REST query failed for ${repoKey}: ${err.message}.`,
          );
        }
      }

      if (repoSuccess) {
        githubReposSucceeded++;
        totalStars += stars;
        if (!latestPushedAt || new Date(pushedAt) > new Date(latestPushedAt)) {
          latestPushedAt = pushedAt;
        }
        if (archived) {
          isArchived = true;
        }
        if (repoGraphqlSuccess) {
          totalStarsWeekly += starsWeekly;
          totalStarsMonthly += starsMonthly;
        }
      } else {
        graphqlSuccess = false;
      }

      // Respect GitHub API guidelines with a small delay
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    const allGithubSucceeded =
      githubReposAttempted > 0 && githubReposSucceeded === githubReposAttempted;

    if (allGithubSucceeded) {
      if (!graphqlSuccess) {
        totalStarsWeekly = fallback.starsWeekly;
        totalStarsMonthly = fallback.starsMonthly;
      }
    } else {
      totalStars = fallback.stars;
      latestPushedAt = fallback.pushedAt;
      totalStarsWeekly = fallback.starsWeekly;
      totalStarsMonthly = fallback.starsMonthly;
      isArchived = fallback.archived;
    }

    const pushedDate = new Date(latestPushedAt);
    const inactive = pushedDate < oneYearAgo || isArchived;

    const firstUrl = githubUrls[0] || "";
    const firstMatch = firstUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    const primaryOwner = firstMatch ? firstMatch[1] : project.owner || "";
    const primaryRepo = firstMatch ? firstMatch[2] : project.repo || "";

    return {
      ...project,
      owner: primaryOwner,
      repo: primaryRepo,
      stars: totalStars,
      pushedAt: latestPushedAt,
      inactive,
      archived: isArchived,
      starsWeekly: totalStarsWeekly,
      starsMonthly: totalStarsMonthly,
    };
  });

  const CONCURRENCY_LIMIT = 5;
  console.log(
    `Running fetch with a concurrency limit of ${CONCURRENCY_LIMIT}...`,
  );
  const updatedProjects = await limitConcurrency(tasks, CONCURRENCY_LIMIT);

  const outputData = {
    fetchedAt: new Date().toISOString(),
    projects: updatedProjects,
  };

  fs.writeFileSync(ECOSYSTEM_PATH, JSON.stringify(outputData, null, 2), "utf8");
  console.log(`✓ Metadata successfully updated in-place in ${ECOSYSTEM_PATH}`);
}

fetchMetadata().catch(console.error);
