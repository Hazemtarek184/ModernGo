import express from "express";
import * as storeController from "./Store-Controller";
import { asyncHandler } from "../middleware/asyncHandler";

const router = express.Router();

// Specific routes FIRST (before parameterized routes to avoid conflicts)
router.get("/nearby", asyncHandler(storeController.getStoresNearby));
router.get("/search", asyncHandler(storeController.searchStoresByName));
router.get("/category/:category", asyncHandler(storeController.getStoresByCategory));

// Standard CRUD operations (parameterized routes LAST)
router.get("/", asyncHandler(storeController.getStores));
router.post("/", asyncHandler(storeController.createStore));
router.get("/:storeId", asyncHandler(storeController.getStoreById));
router.put("/:storeId", asyncHandler(storeController.updateStore));
router.delete("/:storeId", asyncHandler(storeController.deleteStore));

export default router;