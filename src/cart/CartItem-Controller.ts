import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { CartItemModel } from "./CartItem-Module";
import { UnauthorizedException } from "../utils/error.response";

class CartItemController {
    async getMyCart(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const customerId = req.customer?.customerId;

            if (!customerId) {
                throw new UnauthorizedException("Customer not authenticated");
            }

            const cartItems = await CartItemModel.find({
                customerId: new Types.ObjectId(customerId),
                isActive: true
            }).populate("storeProductId");

            res.status(200).json({
                success: true,
                message: "Cart fetched successfully",
                data: cartItems
            });

        } catch (error) {
            next(error);
        }
    }
}

export default new CartItemController();