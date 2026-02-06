import express from "express";
import StoreController from "./Store-Controller";
import { validation } from "../middleware/middleware-Validation";
import * as validators from "./Store-Validation";
import { authenticateStore } from "../middleware/auth.middleware";

const router = express.Router();

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
