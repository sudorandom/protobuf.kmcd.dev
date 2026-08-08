import fs from "node:fs";
import path from "node:path";

// Publishes the committed generated code under /generated/<repo path>/ so the
// site can link to it directly. Copied at build time so the published files
// can never drift from what `buf generate` produces.
const repoRoot = path.resolve("..");
const outputDir = path.join("public", "generated");

const files = ["web/src/gen/demo/v1/user_pb.ts", "gen/go/demo/v1/user.pb.go"];

fs.rmSync(outputDir, { recursive: true, force: true });

for (const file of files) {
  const source = path.join(repoRoot, file);
  if (!fs.existsSync(source)) {
    console.warn(`Generated file not found: ${file}, skipping...`);
    continue;
  }

  const output = path.join(outputDir, file);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.copyFileSync(source, output);
  console.log(`Copied ${file} to ${output}.`);
}
