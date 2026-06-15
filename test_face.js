"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const face_comparer_1 = require("./src/utils/face-comparer");
async function main() {
    const res = await fetch("https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/images/bbt1.jpg");
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUri = `data:image/jpeg;base64,${base64}`;
    console.log("Running compareFaces...");
    const result = await (0, face_comparer_1.compareFaces)(dataUri, dataUri);
    console.log("Result:", result);
}
main().catch(console.error);
//# sourceMappingURL=test_face.js.map