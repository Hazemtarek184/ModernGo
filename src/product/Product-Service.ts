import { Types } from "mongoose";
import { ProductModel } from "./Product-Module";
import { ProductRepository } from "../DB/repository";
import { BadRequestException, NotFoundException } from "../utils/error.response";
import { v4 as uuid } from "uuid";
import { uploadFiles } from "../utils/s3.config";
import { StorageEnum } from "../utils/cloud.multer";
import slugify from "slugify";

interface CreateProductDto {
    name: string;
    description: string;
    mainPrice: number;
    discountPercent?: number | undefined;
    stock: number;
    slug?: string | undefined;
}

interface UpdateProductDto {
    name?: string | undefined;
    description?: string | undefined;
    mainPrice?: number | undefined;
    discountPercent?: number | undefined;
    stock?: number | undefined;
    slug?: string | undefined;
}

class ProductService {
    private productRepository = new ProductRepository(ProductModel);

    constructor() { }

    /**
     * Check if a store owns a specific product
     */
    async isProductOwner(productId: string, storeId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(productId)) {
            throw new BadRequestException("Invalid productId format");
        }

        const product = await ProductModel.findById(productId).select("createdBy").lean();

        if (!product) {
            throw new NotFoundException("Product not found");
        }

        return product.createdBy?.toString() === storeId;
    }

    /**
     * Create a new product without images
     */
    async createProduct(dto: CreateProductDto, storeId: string) {
        const assistFolderId = uuid();

        const salePrice =
            dto.mainPrice - (dto.mainPrice * ((dto.discountPercent ?? 0) / 100));

        const slug = slugify(dto.name, { lower: true, strict: true });

        const [product] = await this.productRepository.create({
            data: [
                {
                    ...dto,
                    assistFolderId,
                    images: [],
                    salePrice,
                    slug,
                    createdBy: new Types.ObjectId(storeId),
                },
            ],
        });

        if (!product) {
            throw new BadRequestException("Failed to create this product instance");
        }

        return product;
    }

    /**
     * Upload product images after product creation
     */
    async uploadProductImages(
        productId: string,
        files: Express.Multer.File[],
        storeId: string
    ) {
        if (!Types.ObjectId.isValid(productId)) {
            throw new BadRequestException("Invalid productId format");
        }

        const product = await ProductModel.findById(productId);

        if (!product) {
            throw new NotFoundException("Product not found");
        }

        if (!files.length) {
            throw new BadRequestException("images are required");
        }

        const uploadedImages = await uploadFiles({
            storageApproach: StorageEnum.memory,
            files,
            path: `products/${product.assistFolderId}`,
            useLarge: true,
        });

        const currentImages = Array.isArray(product.images) ? product.images : [];

        const updatedProduct = await this.productRepository.findOneAndUpdate({
            filter: { _id: new Types.ObjectId(productId) },
            update: {
                images: [...currentImages, ...uploadedImages],
                updatedBy: new Types.ObjectId(storeId),
            },
            options: { new: true },
        });

        if (!updatedProduct) {
            throw new BadRequestException("Failed to upload product images");
        }

        return updatedProduct;
    }

    /**
     * Get one product image key by index for proxy streaming
     */
    async getProductImageKey(productId: string, index: number) {
        if (!Types.ObjectId.isValid(productId)) {
            throw new BadRequestException("Invalid productId format");
        }

        if (Number.isNaN(index) || index < 0) {
            throw new BadRequestException("Invalid image index");
        }

        const product = await ProductModel.findById(productId).select("images");

        if (!product) {
            throw new NotFoundException("Product not found");
        }

        if (!Array.isArray(product.images) || !product.images.length) {
            throw new NotFoundException("Product images not found");
        }

        const key = product.images[index];

        if (!key) {
            throw new NotFoundException("Image not found at this index");
        }

        return key;
    }

    /**
     * Update an existing product
     */
    async updateProduct(
        productId: string,
        dto: UpdateProductDto,
        storeId: string
    ) {
        if (!Types.ObjectId.isValid(productId)) {
            throw new BadRequestException("Invalid productId format");
        }

        const product = await ProductModel.findById(productId);

        if (!product) {
            throw new NotFoundException("Failed to find matching product instance");
        }

        let salePrice = product.salePrice;
        if (dto.mainPrice !== undefined || dto.discountPercent !== undefined) {
            const mainPrice = dto.mainPrice ?? product.mainPrice;
            const discountPercent = dto.discountPercent ?? product.discountPercent;
            const finalPrice = mainPrice - (mainPrice * (discountPercent / 100));
            salePrice = finalPrice > 0 ? finalPrice : 1;
        }

        const slug = dto.name ? slugify(dto.name, { lower: true, strict: true }) : undefined;

        const updatedProduct = await this.productRepository.findOneAndUpdate({
            filter: { _id: new Types.ObjectId(productId) },
            update: {
                ...dto,
                ...(slug && { slug }),
                salePrice,
                updatedBy: new Types.ObjectId(storeId),
            },
            options: { new: true },
        });

        if (!updatedProduct) {
            throw new BadRequestException("Failed to update this product instance");
        }

        return updatedProduct;
    }

    /**
     * Update product attachments/images
     */
    async updateProductAttachment(
        productId: string,
        files: Express.Multer.File[],
        storeId: string,
        updateData?: any
    ) {
        if (!Types.ObjectId.isValid(productId)) {
            throw new BadRequestException("Invalid productId format");
        }

        const product = await ProductModel.findById(productId);

        if (!product) {
            throw new NotFoundException("Failed to find matching product instance");
        }

        let attachment: string[] = [];
        if (files.length > 0) {
            attachment = await uploadFiles({
                files,
                path: `products/${product.assistFolderId}`,
            });
        }

        const updates = {
            ...updateData,
            ...(attachment.length > 0 && { images: attachment }),
            updatedBy: new Types.ObjectId(storeId),
        };

        const updatedProduct = await this.productRepository.findOneAndUpdate({
            filter: { _id: new Types.ObjectId(productId) },
            update: updates,
            options: { new: true },
        });

        if (!updatedProduct) {
            throw new BadRequestException("Failed to update this product instance");
        }

        return updatedProduct;
    }

    /**
     * Freeze a product (soft delete)
     */
    async freezeProduct(productId: string, storeId: string) {
        if (!Types.ObjectId.isValid(productId)) {
            throw new BadRequestException("Invalid productId format");
        }

        const updated = await this.productRepository.updateOne({
            filter: {
                _id: new Types.ObjectId(productId),
                freezedAt: { $exists: false },
            },
            update: {
                $set: {
                    freezedAt: new Date(),
                    freezedBy: new Types.ObjectId(storeId),
                },
            },
        });

        if (updated.matchedCount === 0) {
            throw new NotFoundException("Product not found or already frozen");
        }

        return { productId };
    }

    /**
     * Restore a frozen product
     */
    async restoreProduct(productId: string, storeId: string) {
        if (!Types.ObjectId.isValid(productId)) {
            throw new BadRequestException("Invalid productId format");
        }

        const restored = await this.productRepository.updateOne({
            filter: {
                _id: new Types.ObjectId(productId),
                freezedAt: { $exists: true },
            },
            update: {
                $unset: {
                    freezedAt: 1,
                    freezedBy: 1,
                },
                $set: {
                    restoredAt: new Date(),
                    restoredBy: new Types.ObjectId(storeId),
                },
            },
        });

        if (restored.matchedCount === 0) {
            throw new NotFoundException("Product not found or failed to restore this resource");
        }
    }
}

export default new ProductService();