/**
 * Server-side face comparison using @vladmandic/face-api.
 *
 * Uses the WASM TensorFlow backend (no native compilation needed).
 * Models are loaded lazily on the first call to compareFaces(), and cached
 * for subsequent calls. Tensors are explicitly disposed after each comparison
 * to prevent memory leaks.
 */
import path from "path";
import sharp from "sharp";
import * as tf from "@tensorflow/tfjs";
import { setWasmPath } from "@tensorflow/tfjs-backend-wasm";
import * as faceapi from "@vladmandic/face-api";

// Point tfjs at the WASM binaries shipped with the package
setWasmPath(path.join(process.cwd(), "node_modules", "@tensorflow", "tfjs-backend-wasm", "dist"));

// ── Types ────────────────────────────────────────────────────────────

export interface FaceComparisonSuccess {
    status: "verified" | "face_mismatch";
    matched: boolean;
    distance: number;
}

export interface FaceComparisonError {
    status: "no_face_detected" | "model_load_failed" | "processing_error";
    matched: false;
    detail: string;
}

export type FaceComparisonResult = FaceComparisonSuccess | FaceComparisonError;

// ── Lazy model loading (singleton) ───────────────────────────────────

const MODELS_DIR = path.resolve(process.cwd(), "models", "face-api");

let loadPromise: Promise<void> | null = null;

async function loadModels(): Promise<void> {
    await tf.ready(); // ensure TensorFlow backend is initialised
    await faceapi.nets.tinyFaceDetector.loadFromDisk(MODELS_DIR);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_DIR);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_DIR);
}

function ensureModelsLoaded(): Promise<void> {
    if (!loadPromise) {
        loadPromise = loadModels().catch((err) => {
            loadPromise = null; // reset so the next caller retries
            throw err;
        });
    }
    return loadPromise;
}

// ── Data URI → Tensor (via sharp — no native tfjs addon needed) ─────

async function dataUriToTensor(dataUri: string): Promise<tf.Tensor3D> {
    const match = dataUri.match(/^data:image\/\w+;base64,(.+)$/);
    if (!match?.[1]) {
        throw new Error("Invalid image data URI");
    }
    const buffer = Buffer.from(match[1], "base64");
    const image = sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { data, info } = await image;
    // info: { width, height, channels } — always 4 with ensureAlpha
    const rgbData = new Uint8Array(info.width * info.height * 3);
    for (let i = 0; i < info.width * info.height; i++) {
        rgbData[i * 3] = data[i * 4];       // R
        rgbData[i * 3 + 1] = data[i * 4 + 1]; // G
        rgbData[i * 3 + 2] = data[i * 4 + 2]; // B
    }
    return tf.tensor3d(rgbData, [info.height, info.width, 3]) as tf.Tensor3D;
}

// ── Descriptor extraction ───────────────────────────────────────────

async function extractDescriptor(
    tensor: tf.Tensor3D,
): Promise<Float32Array | null> {
    const detection = await faceapi
        .detectSingleFace(tensor, new faceapi.TinyFaceDetectorOptions({
            inputSize: 320,
            scoreThreshold: 0.5,
        }))
        .withFaceLandmarks()
        .withFaceDescriptor();

    return detection?.descriptor ?? null;
}

// ── Public API ───────────────────────────────────────────────────────

export async function compareFaces(
    profilePhotoDataUri: string,
    verificationPhotoDataUri: string,
): Promise<FaceComparisonResult> {
    // 1. Load models on first call
    try {
        await ensureModelsLoaded();
    } catch (err: any) {
        return {
            status: "model_load_failed",
            matched: false,
            detail: err?.message ?? "Failed to load face recognition models",
        };
    }

    let profileTensor: tf.Tensor3D | null = null;
    let verifyTensor: tf.Tensor3D | null = null;

    try {
        [profileTensor, verifyTensor] = await Promise.all([
            dataUriToTensor(profilePhotoDataUri),
            dataUriToTensor(verificationPhotoDataUri),
        ]);
    } catch (err: any) {
        return {
            status: "processing_error",
            matched: false,
            detail: err?.message ?? "Failed to decode image data",
        };
    }

    try {
        const [profileDesc, verifyDesc] = await Promise.all([
            extractDescriptor(profileTensor),
            extractDescriptor(verifyTensor),
        ]);

        if (!profileDesc) {
            return {
                status: "no_face_detected",
                matched: false,
                detail: "No face detected in your profile photo. Please contact support.",
            };
        }
        if (!verifyDesc) {
            return {
                status: "no_face_detected",
                matched: false,
                detail: "No face detected in the verification photo. Please retake with your face clearly visible.",
            };
        }

        const distance = faceapi.euclideanDistance(profileDesc, verifyDesc);
        const matched = distance < 0.6;

        return {
            status: matched ? "verified" : "face_mismatch",
            matched,
            distance: Math.round(distance * 1000) / 1000,
        };
    } catch (err: any) {
        return {
            status: "processing_error",
            matched: false,
            detail: err?.message ?? "Unexpected error during face comparison",
        };
    } finally {
        profileTensor?.dispose();
        verifyTensor?.dispose();
    }
}
