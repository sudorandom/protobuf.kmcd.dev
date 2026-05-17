import sharp from "sharp";
import fs from "fs";
import path from "path";

const inputSvg = "src/assets/how-it-works.svg";
const outputDir = "public";

async function generateImages() {
  if (!fs.existsSync(inputSvg)) {
    console.error(`Input SVG not found: ${inputSvg}`);
    return;
  }

  const svgBuffer = fs.readFileSync(inputSvg);

  const sizes = [
    { name: "og-image.png", width: 1200, height: 630 },
    { name: "twitter-image.png", width: 1200, height: 600 },
  ];

  for (const size of sizes) {
    console.log(`Generating ${size.name}...`);
    await sharp(svgBuffer)
      .resize(size.width, size.height, {
        fit: "contain",
        background: { r: 5, g: 5, b: 5, alpha: 1 },
      })
      .png()
      .toFile(path.join(outputDir, size.name));
  }

  console.log("Social images generated successfully.");
}

generateImages().catch(console.error);
