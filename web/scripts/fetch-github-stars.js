import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INPUT_PATH = path.resolve(__dirname, "../src/data/ecosystem.json");
const OUTPUT_PATH = path.resolve(__dirname, "../src/data/ecosystem-stars.json");

async function fetchStars() {
  console.log(
    "Fetching GitHub star counts and activity metadata for ecosystem projects...",
  );

  if (!fs.existsSync(INPUT_PATH)) {
    console.error(`Input file not found: ${INPUT_PATH}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(INPUT_PATH, "utf8");
  const projects = JSON.parse(rawData);

  // Load existing metadata from the last version of the stars file if it exists.
  // Used as fallback when the GitHub API is unavailable or rate-limited.
  const existingMetadata = {};
  if (fs.existsSync(OUTPUT_PATH)) {
    try {
      const existingData = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf8"));
      if (existingData && Array.isArray(existingData.projects)) {
        for (const p of existingData.projects) {
          existingMetadata[p.name] = {
            stars: p.stars || 0,
            pushedAt: p.pushedAt || new Date().toISOString(),
          };
        }
        console.log(
          `Loaded existing fallback metadata for ${Object.keys(existingMetadata).length} projects from ${OUTPUT_PATH}`,
        );
      }
    } catch (err) {
      console.warn(
        `Could not read existing stars file at ${OUTPUT_PATH}: ${err.message}`,
      );
    }
  }

  const token = process.env.GITHUB_TOKEN;
  const headers = {
    "User-Agent": "Protobuf-Ecosystem-Fetcher/1.0",
  };
  if (token) {
    headers["Authorization"] = `token ${token}`;
    console.log("Using GITHUB_TOKEN for authentication.");
  } else {
    console.log(
      "No GITHUB_TOKEN detected. Performing unauthenticated fetch (rate limit 60/hr).",
    );
  }

  const updatedProjects = [];
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  for (const project of projects) {
    const githubUrls = Array.isArray(project.github)
      ? project.github
      : project.github
        ? [project.github]
        : [];

    let totalStars = 0;
    let latestPushedAt = null;

    // Use project name fallback if we can't fetch individual repos
    const fallback = existingMetadata[project.name] || {
      stars: 0,
      pushedAt: new Date(0).toISOString(),
    };

    for (const url of githubUrls) {
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) continue;
      const owner = match[1];
      const repo = match[2];
      const repoKey = `${owner}/${repo}`;

      let stars = 0;
      let pushedAt = new Date(0).toISOString();

      try {
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
        console.log(`Fetching ${apiUrl}...`);
        const res = await fetch(apiUrl, { headers });

        if (res.ok) {
          const data = await res.json();
          stars = data.stargazers_count;
          pushedAt = data.pushed_at;
          console.log(
            `  ✓ ${repoKey} has ${stars} stars, last pushed ${pushedAt}`,
          );
        } else {
          console.warn(
            `  ⚠ Failed to fetch ${repoKey}: ${res.status} ${res.statusText}.`,
          );
          // If we have single repo or it matches the fallback, we can try using fallback values
          if (githubUrls.length === 1) {
            stars = fallback.stars;
            pushedAt = fallback.pushedAt;
          }
        }
      } catch (err) {
        console.warn(`  ⚠ Error fetching ${repoKey}: ${err.message}.`);
        if (githubUrls.length === 1) {
          stars = fallback.stars;
          pushedAt = fallback.pushedAt;
        }
      }

      totalStars += stars;
      if (!latestPushedAt || new Date(pushedAt) > new Date(latestPushedAt)) {
        latestPushedAt = pushedAt;
      }

      // Small delay to respect rate limit guidelines
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    if (!latestPushedAt || latestPushedAt === new Date(0).toISOString()) {
      latestPushedAt = fallback.pushedAt || new Date().toISOString();
      totalStars = fallback.stars || 0;
    }

    // Determine if repository has been inactive (no pushed commits) for 1+ years
    const pushedDate = new Date(latestPushedAt);
    const inactive = pushedDate < oneYearAgo;

    // Use the first repo's owner/repo as top-level fields for backwards compatibility
    const firstUrl = githubUrls[0] || "";
    const firstMatch = firstUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    const primaryOwner = firstMatch ? firstMatch[1] : project.owner || "";
    const primaryRepo = firstMatch ? firstMatch[2] : project.repo || "";

    updatedProjects.push({
      ...project,
      owner: primaryOwner,
      repo: primaryRepo,
      stars: totalStars,
      pushedAt: latestPushedAt,
      inactive,
    });
  }

  const outputData = {
    fetchedAt: new Date().toISOString(),
    projects: updatedProjects,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(outputData, null, 2), "utf8");
  console.log(
    `✓ Star counts and activity metadata successfully written to ${OUTPUT_PATH}`,
  );
}

fetchStars().catch(console.error);
