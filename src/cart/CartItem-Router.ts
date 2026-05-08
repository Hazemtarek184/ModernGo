import express from "express";
import CartItemController from "./CartItem-Controller";
import { authenticateCustomer } from "../middleware/auth.middleware";

const router = express.Router();

// Get authenticated customer's cart
router.get(
    "/me",
    authenticateCustomer,
    CartItemController.getMyCart
);

export default router;