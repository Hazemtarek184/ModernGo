import express from "express";
import StoreProductController from "./StoreProduct-Controller";
import { validation } from "../middleware/middleware-Validation";
import * as validators from "./StoreProduct-Validation";
import { authenticateStore } from "../middleware/auth.middleware";

const router = express.Router();

// ─── Nearby Product-Store Queries (public, specific routes FIRST) ───

// Search nearby stores by product name query
router.get(
    "/products/stores/nearby",
    validation(validators.searchNearbyProductStoresSchema),
    StoreProductController.searchNearbyProductStores
);

// Find nearby stores selling a specific product by ID
router.get(
    "/products/:productId/stores/nearby",
    validation(validators.getNearbyStoresForProductSchema),
    StoreProductController.getNearbyStoresForProduct
);

// ─── Standard Store-Product Routes ──────────────────────────────

// Add a product to a store (protected - store owner only)
router.post(
    "/stores/:storeId/products",
    authenticateStore,
    validation(validators.addProductToStoreSchema),
    StoreProductController.addProductToStore
);

// Get all products in a store (public)
router.get(
    "/stores/:storeId/products",
    validation(validators.getStoreProductsSchema),
    StoreProductController.getStoreProducts
);

// Get all stores selling a product (public)
router.get(
    "/products/:productId/stores",
    validation(validators.getProductStoresSchema),
    StoreProductController.getProductStores
);

// Update store-specific product details (protected - store owner only)
router.patch(
    "/stores/:storeId/products/:productId",
    authenticateStore,
    validation(validators.updateStoreProductSchema),
    StoreProductController.updateStoreProduct
);

// Remove a product from a store (protected - store owner only)
router.delete(
    "/stores/:storeId/products/:productId",
    authenticateStore,
    validation(validators.removeProductFromStoreSchema),
    StoreProductController.removeProductFromStore
);

export default router;
