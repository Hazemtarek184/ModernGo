"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const tf = __importStar(require("@tensorflow/tfjs"));
const tfjs_backend_wasm_1 = require("@tensorflow/tfjs-backend-wasm");
const wasmDir = path_1.default.join(process.cwd(), "node_modules", "@tensorflow", "tfjs-backend-wasm", "dist");
(0, tfjs_backend_wasm_1.setWasmPaths)({
    'tfjs-backend-wasm.wasm': path_1.default.join(wasmDir, 'tfjs-backend-wasm.wasm'),
    'tfjs-backend-wasm-simd.wasm': path_1.default.join(wasmDir, 'tfjs-backend-wasm-simd.wasm'),
    'tfjs-backend-wasm-threaded-simd.wasm': path_1.default.join(wasmDir, 'tfjs-backend-wasm-threaded-simd.wasm')
});
async function run() {
    await tf.ready();
    console.log("TF backend:", tf.getBackend());
    const t = tf.tensor3d(new Uint8Array(100 * 100 * 3), [100, 100, 3]);
    console.log("Tensor dtype:", t.dtype);
    console.log("Tensor shape:", t.shape);
}
run();
//# sourceMappingURL=debug_tensor.js.map