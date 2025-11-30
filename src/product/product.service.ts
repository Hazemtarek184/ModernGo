import { Types } from "mongoose";
import { ProductModel } from "./product.module";
import { ProductRepository } from "../DB/repository";
import { BadRequestException, NotFoundException } from "../utils/error.response";
import { v4 as uuid } from 'uuid';
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
     * Create a new product
     */
    async createProduct(
        dto: CreateProductDto,
        files: Express.Multer.File[]
    ) {
        const assistFolderId = uuid();

        // Upload files to S3
        const images = await uploadFiles({
            storageApproach: StorageEnum.memory,
            files,
            path: `products/${assistFolderId}`,
            useLarge: true
        });

        // Calculate sale price
        const salePrice = dto.mainPrice - (dto.mainPrice * ((dto.discountPercent ?? 0) / 100));

        // Generate slug from product name
        const slug = slugify(dto.name, { lower: true, strict: true });

        // Create product
        const [product] = await this.productRepository.create({
            data: [{
                ...dto,
                assistFolderId,
                images,
                salePrice,
                slug,
                // createdBy: req.user?._id
            }]
        });

        if (!product) {
            throw new BadRequestException("Failed to create this product instance");
        }

        return product;
    }

    /**
     * Update an existing product
     */
    async updateProduct(
        productId: string,
        dto: UpdateProductDto
    ) {
        // Validate product ID format
        if (!Types.ObjectId.isValid(productId)) {
            throw new BadRequestException("Invalid productId format");
        }

        // Find existing product
        const product = await ProductModel.findById(productId);

        if (!product) {
            throw new NotFoundException("Failed to find matching product instance");
        }

        // Recalculate sale price if needed
        let salePrice = product.salePrice;
        if (dto.mainPrice !== undefined || dto.discountPercent !== undefined) {
            const mainPrice = dto.mainPrice ?? product.mainPrice;
            const discountPercent = dto.discountPercent ?? product.discountPercent;
            const finalPrice = mainPrice - (mainPrice * (discountPercent / 100));
            salePrice = finalPrice > 0 ? finalPrice : 1;
        }

        // Generate new slug if name changed
        const slug = dto.name ? slugify(dto.name, { lower: true, strict: true }) : undefined;

        // Update product
        const updatedProduct = await this.productRepository.findOneAndUpdate({
            filter: { _id: new Types.ObjectId(productId) },
            update: {
                ...dto,
                ...(slug && { slug }),
                salePrice,
                // updatedBy: user._id
            },
            options: { new: true }
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
        updateData?: any
    ) {
        // Validate product ID format
        if (!Types.ObjectId.isValid(productId)) {
            throw new BadRequestException("Invalid productId format");
        }

        // Find existing product
        const product = await ProductModel.findById(productId);

        if (!product) {
            throw new NotFoundException("Failed to find matching product instance");
        }

        // Upload new files if provided
        let attachment: string[] = [];
        if (files.length > 0) {
            attachment = await uploadFiles({
                files,
                path: `products/${product.assistFolderId}`,
            });
        }

        // Update product
        const updates = {
            ...updateData,
            ...(attachment.length > 0 && { images: attachment }),
            // updatedBy: req.user?.id,
        };

        const updatedProduct = await this.productRepository.findOneAndUpdate({
            filter: { _id: new Types.ObjectId(productId) },
            update: updates,
            options: { new: true }
        });

        if (!updatedProduct) {
            throw new BadRequestException("Failed to update this product instance");
        }

        return updatedProduct;
    }

    /**
     * Freeze a product (soft delete)
     */
    async freezeProduct(productId: string) {
        // Validate product ID format
        if (!Types.ObjectId.isValid(productId)) {
            throw new BadRequestException("Invalid productId format");
        }

        const updated = await this.productRepository.updateOne({
            filter: {
                _id: new Types.ObjectId(productId),
                freezedAt: { $exists: false }
            },
            update: {
                $set: {
                    freezedAt: new Date(),
                    // freezedBy: req.user?.id,
                    changeCredentialsTime: new Date(),
                }
            }
        });

        if (updated.matchedCount === 0) {
            throw new NotFoundException("Product not found or already frozen");
        }

        return { productId };
    }

    /**
     * Restore a frozen product
     */
    async restoreProduct(productId: string) {
        // Validate product ID format
        if (!Types.ObjectId.isValid(productId)) {
            throw new BadRequestException("Invalid productId format");
        }

        const restored = await this.productRepository.updateOne({
            filter: {
                _id: new Types.ObjectId(productId),
                freezedAt: { $exists: true }
            },
            update: {
                $unset: {
                    freezedAt: 1,
                    freezedBy: 1
                },
                $set: {
                    restoreAt: new Date(),
                    // restoreBy: req.user?.id
                }
            }
        });

        if (restored.matchedCount === 0) {
            throw new NotFoundException("Product not found or failed to restore this resource");
        }
    }
}

export default new ProductService();
