import sharp from "sharp";
import fs from "fs";
import path from "path";

const outputDir = "public";
const diagramOutputDir = path.join(outputDir, "diagrams");

const diagrams = [
  "src/assets/how-it-works.svg",
  "src/assets/hero-social.svg",
  "src/assets/schema-data-binary.svg",
  "src/assets/schema-compiler-generated-code.svg",
  "src/assets/reserved-fields.svg",
  "src/assets/deprecated-field.svg",
  "src/assets/protovalidate-json-errors.svg",
  "src/assets/maps-are-repeated-entries.svg",
  "src/assets/well-known-types.svg",
  "src/assets/field-presence-proto3.svg",
];

async function generateImages() {
  fs.mkdirSync(diagramOutputDir, { recursive: true });

  for (const input of diagrams) {
    if (!fs.existsSync(input)) {
      console.warn(`Input SVG not found: ${input}, skipping SVG copy...`);
      continue;
    }

    const output = path.join(diagramOutputDir, path.basename(input));
    fs.copyFileSync(input, output);
    console.log(`Rendered ${output} from ${input}.`);
  }

  const tasks = [
    {
      input: "src/assets/how-it-works.svg",
      outputs: [
        { name: "og-image.png", width: 1200, height: 630 },
        { name: "twitter-image.png", width: 1200, height: 600 },
      ],
    },
    {
      input: "src/assets/hero-social.svg",
      outputs: [{ name: "hero-social.png", width: 1200, height: 630 }],
    },
  ];

  for (const task of tasks) {
    if (!fs.existsSync(task.input)) {
      console.warn(`Input SVG not found: ${task.input}, skipping...`);
      continue;
    }

    const svgBuffer = fs.readFileSync(task.input);

    for (const size of task.outputs) {
      console.log(`Generating ${size.name} from ${task.input}...`);
      await sharp(svgBuffer)
        .resize(size.width, size.height, {
          fit: "contain",
          background: { r: 5, g: 5, b: 5, alpha: 1 },
        })
        .png()
        .toFile(path.join(outputDir, size.name));
    }
  }

  console.log("Social images generated successfully.");
}

generateImages().catch(console.error);
