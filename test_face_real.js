"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const face_comparer_1 = require("./src/utils/face-comparer");
const https_1 = __importDefault(require("https"));
async function downloadImage(url) {
    return new Promise((resolve, reject) => {
        https_1.default.get(url, (res) => {
            const data = [];
            res.on("data", (chunk) => data.push(chunk));
            res.on("end", () => resolve(Buffer.concat(data)));
        }).on("error", reject);
    });
}
async function main() {
    const buffer = await downloadImage("https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/1200px-Python-logo-notext.svg.png");
    const faceBuffer = await downloadImage("https://raw.githubusercontent.com/vladmandic/face-api/master/demo/sample1.jpg");
    console.log("Magic numbers:", faceBuffer.slice(0, 4).toString("hex"));
    const base64 = faceBuffer.toString("base64");
    const dataUri = `data:image/jpeg;base64,${base64}`;
    console.log("Running compareFaces with downloaded face...");
    const result = await (0, face_comparer_1.compareFaces)(dataUri, dataUri);
    console.log("Result:", result);
}
main().catch(console.error);
//# sourceMappingURL=test_face_real.js.map