import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, "../dist");
const BASE_URL = "https://protobuf.kmcd.dev";

// Routes that need static index.html files for direct access
const APP_ROUTES = [
  "intro",
  "basics",
  "advanced",
  "efficiency",
  "binary",
  "ecosystem",
  "conclusion",
];

async function run() {
  console.log("Applying GitHub Pages & SEO fixes...");

  if (!fs.existsSync(DIST_DIR)) {
    console.error(`Dist directory not found: ${DIST_DIR}`);
    process.exit(1);
  }

  // 1. GitHub Pages 404.html fix
  const indexHtml = path.join(DIST_DIR, "index.html");
  const fallbackHtml = path.join(DIST_DIR, "404.html");
  fs.copyFileSync(indexHtml, fallbackHtml);
  console.log("✓ Created 404.html");

  // 2. Static route directories for deep linking
  for (const route of APP_ROUTES) {
    const routeDir = path.join(DIST_DIR, route);
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }
    fs.copyFileSync(indexHtml, path.join(routeDir, "index.html"));
    console.log(`✓ Generated static route: /${route}`);
  }

  // 3. Sitemap generation
  const today = new Date().toISOString().split("T")[0];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <priority>1.0</priority>
  </url>
${APP_ROUTES.map(
  (route) => `  <url>
    <loc>${BASE_URL}/${route}/</loc>
    <lastmod>${today}</lastmod>
    <priority>0.8</priority>
  </url>`,
).join("\n")}
</urlset>`;

  fs.writeFileSync(path.join(DIST_DIR, "sitemap.xml"), sitemap);
  console.log("✓ Generated sitemap.xml");

  console.log("Done.");
}

run().catch(console.error);
