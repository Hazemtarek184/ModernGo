import type { Request, Response } from "express";
import { BadRequestException, ForbiddenException } from "../utils/error.response";
import { successResponse } from "../utils/success.response";
import ProductService from "./Product-Service";
import { getFile } from "../utils/s3.config";

class ProductController {
    constructor() { }

    /**
     * POST /api/products
     * Create a new product
     */
    createProduct = async (req: Request, res: Response): Promise<Response> => {
        const storeId = req.store!.storeId;

        const product = await ProductService.createProduct(req.body, storeId);

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

        await this.verifyProductOwnership(productId!, storeId);

        const updatedProduct = await ProductService.updateProduct(productId!, req.body, storeId);

        return successResponse({
            res,
            statuscode: 200,
            data: { updatedProduct }
        });
    };

    /**
     * POST /api/products/:productId/images
     * Upload product images
     */
    uploadProductImages = async (req: Request, res: Response): Promise<Response> => {
        const { productId } = req.params;
        const storeId = req.store!.storeId;
        const files = (req.files as Express.Multer.File[]) || [];

        await this.verifyProductOwnership(productId!, storeId);

        if (!files.length) {
            throw new BadRequestException("images are required");
        }

        const updatedProduct = await ProductService.uploadProductImages(
            productId!,
            files,
            storeId
        );

        return successResponse({
            res,
            statuscode: 200,
            data: { updatedProduct }
        });
    };

    /**
     * GET /api/products/:productId/images/:index
     * Get one product image by index (proxy)
     */
    getProductImage = async (req: Request, res: Response): Promise<void> => {
        const { productId, index } = req.params;

        const key = await ProductService.getProductImageKey(productId!, Number(index));
        const file = await getFile({ Key: key });

        if (!file.Body) {
            throw new BadRequestException("Failed to load product image");
        }

        if (file.ContentType) {
            res.setHeader("Content-Type", file.ContentType);
        }

        if (file.ContentLength) {
            res.setHeader("Content-Length", file.ContentLength.toString());
        }

        res.setHeader("Cache-Control", "public, max-age=86400");
        (file.Body as NodeJS.ReadableStream).pipe(res);
    };

    /**
     * PATCH /api/products/:productId/attachment
     * Update product attachments/images
     */
    updateProductAttachment = async (req: Request, res: Response): Promise<Response> => {
        const { productId } = req.params;
        const storeId = req.store!.storeId;
        const files = (req.files as Express.Multer.File[]) || [];

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