import express from "express";
import StoreProductController from "./StoreProduct-Controller";
import { validation } from "../middleware/middleware-Validation";
import { asyncHandler } from "../middleware/asyncHandler";
import * as validators from "./StoreProduct-Validation";

const router = express.Router();

// Add a product to a store
router.post(
    "/stores/:storeId/products",
    validation(validators.addProductToStoreSchema),
    asyncHandler(StoreProductController.addProductToStore)
);

// Get all products in a store
router.get(
    "/stores/:storeId/products",
    validation(validators.getStoreProductsSchema),
    asyncHandler(StoreProductController.getStoreProducts)
);

// Get all stores selling a product
router.get(
    "/products/:productId/stores",
    validation(validators.getProductStoresSchema),
    asyncHandler(StoreProductController.getProductStores)
);

// Update store-specific product details
router.patch(
    "/stores/:storeId/products/:productId",
    validation(validators.updateStoreProductSchema),
    asyncHandler(StoreProductController.updateStoreProduct)
);

// Remove a product from a store
router.delete(
    "/stores/:storeId/products/:productId",
    validation(validators.removeProductFromStoreSchema),
    asyncHandler(StoreProductController.removeProductFromStore)
);

export default router;
