/**
 * One-time setup: copy face-api model weights from node_modules into models/face-api/.
 *
 * Usage: npx tsx scripts/setup-face-models.ts
 */
import fs from "fs";
import path from "path";

const SOURCE = path.resolve(__dirname, "..", "node_modules", "@vladmandic", "face-api", "model");
const DEST = path.resolve(__dirname, "..", "models", "face-api");

const REQUIRED_FILES = [
    "tiny_face_detector_model-shard1",
    "tiny_face_detector_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
    "face_landmark_68_model-weights_manifest.json",
    "face_recognition_model-shard1",
    "face_recognition_model-shard2",
    "face_recognition_model-weights_manifest.json",
];

function main() {
    if (!fs.existsSync(SOURCE)) {
        console.error(
            "ERROR: @vladmandic/face-api models not found in node_modules.",
            "Run 'npm install' first.",
        );
        process.exit(1);
    }

    fs.mkdirSync(DEST, { recursive: true });
    let copied = 0;

    for (const file of REQUIRED_FILES) {
        const src = path.join(SOURCE, file);
        const dest = path.join(DEST, file);

        if (fs.existsSync(dest)) {
            console.log(`  SKIP  ${file} (already exists)`);
            continue;
        }
        if (!fs.existsSync(src)) {
            console.error(`  MISSING  ${file} in node_modules`);
            process.exit(1);
        }
        fs.copyFileSync(src, dest);
        console.log(`  COPY  ${file}`);
        copied++;
    }

    console.log(`\nDone. ${copied} model file(s) copied to ${DEST}`);
}

main();
