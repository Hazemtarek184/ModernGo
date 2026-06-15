"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const face_comparer_1 = require("./src/utils/face-comparer");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function main() {
    const imagePath = path_1.default.join(process.cwd(), "src", "seed-images", "apple.png");
    const buffer = fs_1.default.readFileSync(imagePath);
    const base64 = buffer.toString("base64");
    const dataUri = `data:image/png;base64,${base64}`;
    console.log("Running compareFaces...");
    const result = await (0, face_comparer_1.compareFaces)(dataUri, dataUri);
    console.log("Result:", result);
}
main().catch(console.error);
//# sourceMappingURL=test_face_local.js.map