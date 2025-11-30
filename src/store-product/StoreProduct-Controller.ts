import type { Request, Response } from "express";
import * as validators from "./storeProduct.validation";
import { BadRequestException } from "../utils/error.response";
import { successResponse } from "../utils/success.response";
import StoreProductService from "./StoreProduct-Service";

class StoreProductController {
    constructor() { }

    /**
     * POST /stores/:storeId/products
     * Add a product to a store
     */
    addProductToStore = async (req: Request, res: Response): Promise<Response> => {
        const validationResult = validators.addProductToStoreSchema.body.safeParse(req.body);
        if (!validationResult.success) {
            throw new BadRequestException("Validation Error", {
                issues: JSON.parse(validationResult.error as unknown as string),
            });
        }

        const { storeId } = req.params;
        if (!storeId) {
            throw new BadRequestException("Store ID is required");
        }

        const { productId, price, stock, isAvailable } = validationResult.data;

        const storeProduct = await StoreProductService.addProductToStore(
            storeId,
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
        if (!storeId) {
            throw new BadRequestException("Store ID is required");
        }

        const storeProducts = await StoreProductService.getStoreProducts(storeId);

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
        if (!productId) {
            throw new BadRequestException("Product ID is required");
        }

        const productStores = await StoreProductService.getProductStores(productId);

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
        const validationResult = validators.updateStoreProductSchema.body.safeParse(req.body);
        if (!validationResult.success) {
            throw new BadRequestException("Validation Error", {
                issues: JSON.parse(validationResult.error as unknown as string),
            });
        }

        const { storeId, productId } = req.params;
        if (!storeId || !productId) {
            throw new BadRequestException("Store ID and Product ID are required");
        }

        const updates: {
            price?: number | undefined;
            stock?: number | undefined;
            isAvailable?: boolean | undefined;
        } = validationResult.data;

        const updatedStoreProduct = await StoreProductService.updateStoreProduct(
            storeId,
            productId,
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
        if (!storeId || !productId) {
            throw new BadRequestException("Store ID and Product ID are required");
        }

        await StoreProductService.removeProductFromStore(storeId, productId);

        return successResponse({
            res,
            statuscode: 200,
            message: "Product removed from store successfully",
        });
    };
}

export default new StoreProductController();
