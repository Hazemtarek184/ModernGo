import type { Request, Response } from "express";
import * as validators from "./product.validation";
import { BadRequestException } from "../utils/error.response";
import { successResponse } from "../utils/success.response";
import ProductService from "./product.service";

export enum RoleEnum {
    admin = "admin",
    user = "user"
}

class ProductController {
    constructor() { }

    /**
     * POST /api/products
     * Create a new product
     */
    createProduct = async (req: Request, res: Response): Promise<Response> => {
        // Validate request body
        const validationResult = validators.createProductSchema.body.safeParse(req.body);
        if (!validationResult.success) {
            throw new BadRequestException("Validation Error", {
                issues: JSON.parse(validationResult.error as unknown as string)
            });
        }

        // Extract DTO fields (exclude images which come from req.files)
        const { images, ...createProductDto } = validationResult.data;
        const files = req.files as Express.Multer.File[] || [];

        // Call service to create product
        const product = await ProductService.createProduct(createProductDto, files);

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

        if (!productId) {
            throw new BadRequestException("Product ID is required");
        }

        // Validate request body
        const validationResult = validators.createProductSchema.body.safeParse(req.body);
        if (!validationResult.success) {
            throw new BadRequestException("Validation Error", {
                issues: JSON.parse(validationResult.error as unknown as string)
            });
        }

        // Extract DTO fields (exclude images which come from req.files)
        const { images, ...updateProductDto } = validationResult.data;

        // Call service to update product
        const updatedProduct = await ProductService.updateProduct(productId, updateProductDto);

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

        if (!productId) {
            throw new BadRequestException("Missing productId in request params");
        }

        const files = (req.files as Express.Multer.File[]) || [];

        // Call service to update attachments
        const updatedProduct = await ProductService.updateProductAttachment(
            productId,
            files,
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

        if (!productId) {
            throw new BadRequestException("Product ID is required");
        }

        // Call service to freeze product
        const result = await ProductService.freezeProduct(productId);

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

        if (!productId) {
            throw new BadRequestException("Product ID is required");
        }

        // Call service to restore product
        await ProductService.restoreProduct(productId);

        return successResponse({ res });
    };
}

export default new ProductController();