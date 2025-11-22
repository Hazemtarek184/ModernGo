import express from "express";
import * as storeController from "./Store-Controller";

const router = express.Router();

// Basic CRUD operations
router.get("/stores", storeController.getStores);
router.get("/stores/:storeId", storeController.getStoreById);
router.post("/stores", storeController.createStore);
router.put("/stores/:storeId", storeController.updateStore);
router.delete("/stores/:storeId", storeController.deleteStore);

// Geospatial queries
router.get("/stores/nearby", storeController.getStoresNearby);

// Search and filter
router.get("/stores/search", storeController.searchStoresByName);
router.get("/stores/category/:category", storeController.getStoresByCategory);

export default router;