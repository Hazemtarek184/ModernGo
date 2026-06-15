"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const SOURCE = path_1.default.resolve(__dirname, "..", "node_modules", "@vladmandic", "face-api", "model");
const DEST = path_1.default.resolve(__dirname, "..", "models", "face-api");
const REQUIRED_FILES = [
    "tiny_face_detector_model.bin",
    "tiny_face_detector_model-weights_manifest.json",
    "face_landmark_68_model.bin",
    "face_landmark_68_model-weights_manifest.json",
    "face_recognition_model.bin",
    "face_recognition_model-weights_manifest.json",
];
function main() {
    if (!fs_1.default.existsSync(SOURCE)) {
        console.error("ERROR: @vladmandic/face-api models not found in node_modules.", "Run 'npm install' first.");
        process.exit(1);
    }
    fs_1.default.mkdirSync(DEST, { recursive: true });
    let copied = 0;
    for (const file of REQUIRED_FILES) {
        const src = path_1.default.join(SOURCE, file);
        const dest = path_1.default.join(DEST, file);
        if (fs_1.default.existsSync(dest)) {
            console.log(`  SKIP  ${file} (already exists)`);
            continue;
        }
        if (!fs_1.default.existsSync(src)) {
            console.error(`  MISSING  ${file} in node_modules`);
            process.exit(1);
        }
        fs_1.default.copyFileSync(src, dest);
        console.log(`  COPY  ${file}`);
        copied++;
    }
    console.log(`\nDone. ${copied} model file(s) copied to ${DEST}`);
}
main();
//# sourceMappingURL=setup-face-models.js.map