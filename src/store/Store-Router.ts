import express from "express";
import StoreController from "./Store-Controller";
import { validation } from "../middleware/middleware-Validation";
import * as validators from "./Store-Validation";
import { authenticateStore } from "../middleware/auth.middleware";
import { fileUpload, fileValidation } from "../utils/cloud.multer";
import type { Request, Response, NextFunction } from "express";

const router = express.Router();

// ─── JSON Parsing Middleware ──────────────────────────────────
// React FormData stringifies nested objects. This safely parses them back.
const parseMultipartJson = (req: Request, res: Response, next: NextFunction) => {
    if (req.body.location && typeof req.body.location === 'string') {
        try { req.body.location = JSON.parse(req.body.location); } catch (e) {}
    }
    if (req.body.categories && typeof req.body.categories === 'string') {
        try { req.body.categories = JSON.parse(req.body.categories); } catch (e) {}
    }
    next();
};

// ─── Public Auth Routes ─────────────────────────────────────

router.post(
    "/register",
    fileUpload({ validation: fileValidation.image, maxSizeMB: 5 }).single('profilePhoto'),
    parseMultipartJson,
    validation(validators.registerStoreSchema),
    StoreController.registerStore
);

router.post(
    "/login",
    validation(validators.loginStoreSchema),
    StoreController.loginStore
);

// ─── Public Read Routes (specific routes FIRST) ─────────────

router.get(
    "/nearby",
    validation(validators.nearbyStoreSchema),
    StoreController.getStoresNearby
);

router.get(
    "/search",
    validation(validators.searchStoreSchema),
    StoreController.searchStoresByName
);

router.get(
    "/category/:category",
    validation(validators.categoryStoreSchema),
    StoreController.getStoresByCategory
);

router.get(
    "/",
    StoreController.getStores
);

router.get(
    "/:storeId",
    validation(validators.getStoreSchema),
    StoreController.getStoreById
);

// ─── Protected Write Routes ─────────────────────────────────

router.put(
    "/:storeId",
    authenticateStore,
    validation(validators.updateStoreSchema),
    StoreController.updateStore
);

router.delete(
    "/:storeId",
    authenticateStore,
    validation(validators.getStoreSchema),
    StoreController.deleteStore
);

router.patch(
    "/:storeId/password",
    authenticateStore,
    validation(validators.updatePasswordSchema),
    StoreController.updatePassword
);

router.post(
    "/:storeId/profile-image",
    authenticateStore,
    fileUpload({ validation: fileValidation.image, maxSizeMB: 5 }).single("profilePhoto"),
    StoreController.updateProfilePhoto
);

router.delete(
    "/:storeId/profile-image",
    authenticateStore,
    StoreController.deleteProfilePhoto
);

export default router;
