import express from "express";
import CartItemController from "./CartItem-Controller";
import { authenticateCustomer } from "../middleware/auth.middleware";

const router = express.Router();

// Get authenticated customer's cart
router.get(
    "/me",
    authenticateCustomer,
    CartItemController.getMyCart,
);

// Add product to cart and send health profile + product details to AI
router.post(
    "/health-check",
    authenticateCustomer,
    CartItemController.addProductAndCheckHealth,
);

export default router;