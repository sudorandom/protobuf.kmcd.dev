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
          const key = `${p.owner}/${p.repo}`;
          existingMetadata[key] = {
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
    const { owner, repo } = project;
    const repoKey = `${owner}/${repo}`;

    // Find existing metadata fallback values
    const fallback = existingMetadata[repoKey] || {
      stars: 0,
      pushedAt: new Date().toISOString(),
    };
    let stars = fallback.stars;
    let pushedAt = fallback.pushedAt;

    if (owner && repo) {
      try {
        const url = `https://api.github.com/repos/${owner}/${repo}`;
        console.log(`Fetching ${url}...`);
        const res = await fetch(url, { headers });

        if (res.ok) {
          const data = await res.json();
          stars = data.stargazers_count;
          pushedAt = data.pushed_at;
          console.log(
            `  ✓ ${repoKey} has ${stars} stars, last pushed ${pushedAt}`,
          );
        } else {
          console.warn(
            `  ⚠ Failed to fetch ${repoKey}: ${res.status} ${res.statusText}. Using fallback: stars=${stars}, pushed=${pushedAt}`,
          );
        }
      } catch (err) {
        console.warn(
          `  ⚠ Error fetching ${repoKey}: ${err.message}. Using fallback: stars=${stars}, pushed=${pushedAt}`,
        );
      }
    }

    // Determine if repository has been inactive (no pushed commits) for 1+ years
    const pushedDate = new Date(pushedAt);
    const inactive = pushedDate < oneYearAgo;

    updatedProjects.push({
      ...project,
      stars,
      pushedAt,
      inactive,
    });

    // Small delay to respect rate limit guidelines
    await new Promise((resolve) => setTimeout(resolve, 200));
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
