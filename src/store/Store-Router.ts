import express from "express";
import StoreController from "./Store-Controller";
import { validation } from "../middleware/middleware-Validation";
import * as validators from "./Store-Validation";
import { authenticateStore } from "../middleware/auth.middleware";

const router = express.Router();

import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });
// ─── Public Auth Routes ─────────────────────────────────────

router.post(
    "/register",
    validation(validators.registerStoreSchema),
    StoreController.registerStore
);

router.post(
    "/login",
    validation(validators.loginStoreSchema),
    StoreController.loginStore
);


router.patch(
    "/:storeId/logo",
    authenticateStore,
    upload.single("logo"),
    validation(validators.uploadStoreLogoSchema),
    StoreController.uploadStoreLogo
);

router.get(
    "/:storeId/logo",
    validation(validators.getStoreSchema),
    StoreController.getStoreLogo
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

router.get("/", StoreController.getStores);

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

export default router;
