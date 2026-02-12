import type { Request, Response } from "express";
import { ForbiddenException } from "../utils/error.response";
import { successResponse } from "../utils/success.response";
import ProductService from "./Product-Service";

class ProductController {
    constructor() { }

    /**
     * POST /api/products
     * Create a new product
     */
    createProduct = async (req: Request, res: Response): Promise<Response> => {
        const files = req.files as Express.Multer.File[] || [];
        const storeId = req.store!.storeId;

        const product = await ProductService.createProduct(req.body, files, storeId);

        return successResponse({
            res,
            statuscode: 201,
            data: { product }
        });
    };

    /**
     * PATCH /api/products/:productId
     * Update an existing product
     */
    updateProduct = async (req: Request, res: Response): Promise<Response> => {
        const { productId } = req.params;
        const storeId = req.store!.storeId;

        // Verify the authenticated store owns this product
        await this.verifyProductOwnership(productId!, storeId);

        const updatedProduct = await ProductService.updateProduct(productId!, req.body, storeId);

        return successResponse({
            res,
            statuscode: 200,
            data: { updatedProduct }
        });
    };

    /**
     * PATCH /api/products/:productId/attachment
     * Update product attachments/images
     */
    updateProductAttachment = async (req: Request, res: Response): Promise<Response> => {
        const { productId } = req.params;
        const storeId = req.store!.storeId;
        const files = (req.files as Express.Multer.File[]) || [];

        // Verify the authenticated store owns this product
        await this.verifyProductOwnership(productId!, storeId);

        const updatedProduct = await ProductService.updateProductAttachment(
            productId!,
            files,
            storeId,
            req.body
        );

        return successResponse({
            res,
            statuscode: 200,
            data: { updatedProduct },
        });
    };

    /**
     * DELETE /api/products/:productId/freeze
     * Freeze a product (soft delete)
     */
    freezeProduct = async (req: Request, res: Response): Promise<Response> => {
        const { productId } = req.params;
        const storeId = req.store!.storeId;

        // Verify the authenticated store owns this product
        await this.verifyProductOwnership(productId!, storeId);

        const result = await ProductService.freezeProduct(productId!, storeId);

        return successResponse({
            res,
            statuscode: 200,
            data: result
        });
    };

    /**
     * PATCH /api/products/:productId/restore
     * Restore a frozen product
     */
    restoreProduct = async (req: Request, res: Response): Promise<Response> => {
        const { productId } = req.params;
        const storeId = req.store!.storeId;

        // Verify the authenticated store owns this product
        await this.verifyProductOwnership(productId!, storeId);

        await ProductService.restoreProduct(productId!, storeId);

        return successResponse({ res });
    };

    /**
     * Verify that the authenticated store owns the product
     */
    private verifyProductOwnership = async (productId: string, storeId: string): Promise<void> => {
        const isOwner = await ProductService.isProductOwner(productId, storeId);
        if (!isOwner) {
            throw new ForbiddenException("You can only modify your own products");
        }
    };
}

export default new ProductController();
