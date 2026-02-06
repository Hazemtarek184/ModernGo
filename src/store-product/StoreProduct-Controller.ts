import type { Request, Response } from "express";
import { ForbiddenException } from "../utils/error.response";
import { successResponse } from "../utils/success.response";
import StoreProductService from "./StoreProduct-Service";

class StoreProductController {
    constructor() { }

    /**
     * POST /stores/:storeId/products
     * Add a product to a store
     */
    addProductToStore = async (req: Request, res: Response): Promise<Response> => {
        const { storeId } = req.params;

        // Verify the authenticated store owns this resource
        if (req.store!.storeId !== storeId) {
            throw new ForbiddenException("You can only add products to your own store");
        }

        // Body already validated by middleware
        const { productId, price, stock, isAvailable } = req.body;

        const storeProduct = await StoreProductService.addProductToStore(
            storeId!,
            productId,
            price,
            stock,
            isAvailable
        );

        return successResponse({
            res,
            statuscode: 201,
            message: "Product added to store successfully",
            data: { storeProduct },
        });
    };

    /**
     * GET /stores/:storeId/products
     * Get all products in a store
     */
    getStoreProducts = async (req: Request, res: Response): Promise<Response> => {
        const { storeId } = req.params;

        const storeProducts = await StoreProductService.getStoreProducts(storeId!);

        return successResponse({
            res,
            statuscode: 200,
            data: { storeProducts, count: storeProducts.length },
        });
    };

    /**
     * GET /products/:productId/stores
     * Get all stores selling a product
     */
    getProductStores = async (req: Request, res: Response): Promise<Response> => {
        const { productId } = req.params;

        const productStores = await StoreProductService.getProductStores(productId!);

        return successResponse({
            res,
            statuscode: 200,
            data: { productStores, count: productStores.length },
        });
    };

    /**
     * PATCH /stores/:storeId/products/:productId
     * Update store-specific product details
     */
    updateStoreProduct = async (req: Request, res: Response): Promise<Response> => {
        const { storeId, productId } = req.params;

        // Verify the authenticated store owns this resource
        if (req.store!.storeId !== storeId) {
            throw new ForbiddenException("You can only modify products in your own store");
        }

        // Body already validated by middleware
        const updates: {
            price?: number | undefined;
            stock?: number | undefined;
            isAvailable?: boolean | undefined;
        } = req.body;

        const updatedStoreProduct = await StoreProductService.updateStoreProduct(
            storeId!,
            productId!,
            updates
        );

        return successResponse({
            res,
            statuscode: 200,
            message: "Store product updated successfully",
            data: { updatedStoreProduct },
        });
    };

    /**
     * DELETE /stores/:storeId/products/:productId
     * Remove a product from a store
     */
    removeProductFromStore = async (req: Request, res: Response): Promise<Response> => {
        const { storeId, productId } = req.params;

        // Verify the authenticated store owns this resource
        if (req.store!.storeId !== storeId) {
            throw new ForbiddenException("You can only remove products from your own store");
        }

        await StoreProductService.removeProductFromStore(storeId!, productId!);

        return successResponse({
            res,
            statuscode: 200,
            message: "Product removed from store successfully",
        });
    };
}

export default new StoreProductController();
