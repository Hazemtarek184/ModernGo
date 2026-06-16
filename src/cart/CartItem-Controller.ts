import { Request, Response, NextFunction } from "express";
import CartItemService from "./CartItem-Service";
import { asyncHandler, BadRequestException, UnauthorizedException } from "../utils/error.response";

class CartItemController {
    getMyCart = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const customerId = req.customer?.customerId;

        if (!customerId) {
            throw new UnauthorizedException("Customer not authenticated");
        }

        const cartItems = await CartItemService.getCustomerCart(customerId);
        const warnings = await CartItemService.getHealthWarnings(customerId, cartItems);

        res.status(200).json({
            success: true,
            message: "Cart fetched successfully",
            data: {
                cart: cartItems,
                warnings,
            },
        });
    });

    addProductAndCheckHealth = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const customerId = req.customer?.customerId || req.body.customerId;
        const { storeProductId } = req.body;

        if (!customerId) {
            throw new UnauthorizedException("Customer not authenticated");
        }

        if (!storeProductId) {
            throw new BadRequestException("storeProductId is required");
        }

        const result = await CartItemService.addProductToCartAndCheckHealth(
            customerId,
            storeProductId,
        );

        res.status(200).json({
            success: true,
            message: "Product added to cart and health check completed",
            data: result,
        });
    });

    checkout = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const customerId = req.customer?.customerId;

        if (!customerId) {
            throw new UnauthorizedException("Customer not authenticated");
        }

        await CartItemService.clearCustomerCart(customerId);

        res.status(200).json({
            success: true,
            message: "Checkout successful",
        });
    });
}

export default new CartItemController();