import { Types } from "mongoose";
import { ProductModel } from "./Product-Module";
import { ProductRepository } from "../DB/repository";
import { BadRequestException, NotFoundException } from "../utils/error.response";
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

interface GetAllProductsQuery {
    page: number;
    limit: number;
    search?: string | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    sortBy: 'createdAt' | 'mainPrice' | 'salePrice' | 'name';
    sortOrder: 'asc' | 'desc';
}

class ProductService {
    private productRepository = new ProductRepository(ProductModel);

    constructor() { }

    /**
     * Get all products with pagination and filters
     */
    async getAllProducts(query: GetAllProductsQuery) {
        const { page, limit, search, minPrice, maxPrice, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;

        // Build filter object
        const filter: any = {
            freezedAt: { $exists: false } // Only non-frozen products
        };

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.salePrice = {};
            if (minPrice !== undefined) filter.salePrice.$gte = minPrice;
            if (maxPrice !== undefined) filter.salePrice.$lte = maxPrice;
        }

        // Get total count for pagination metadata
        const total = await ProductModel.countDocuments(filter);

        // Execute query
        const products = await ProductModel.find(filter)
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip(skip)
            .limit(limit)
            .populate('createdBy', 'name email profilePhoto');

        return {
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Check if a store owns a specific product
     */
    async isProductOwner(productId: string, storeId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(productId)) {
            throw new BadRequestException("Invalid productId format");
        }

        const product = await ProductModel.findById(productId).select('createdBy').lean();

        if (!product) {
            throw new NotFoundException("Product not found");
        }

        return product.createdBy?.toString() === storeId;
    }

    /**
     * Create a new product
     */
    async createProduct(
        dto: CreateProductDto,
        images: string[],
        storeId: string
    ) {
        // Calculate sale price
        const salePrice = dto.mainPrice - (dto.mainPrice * ((dto.discountPercent ?? 0) / 100));

        // Generate slug from product name
        const slug = slugify(dto.name, { lower: true, strict: true });

        // Create product
        const [product] = await this.productRepository.create({
            data: [{
                ...dto,
                images,
                salePrice,
                slug,
                createdBy: new Types.ObjectId(storeId),
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
        dto: UpdateProductDto,
        storeId: string
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
                updatedBy: new Types.ObjectId(storeId),
            },
            options: { returnDocument: "after" }
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
        images: string[],
        storeId: string,
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

        const attachment: string[] = images;

        // Update product
        const updates = {
            ...updateData,
            ...(attachment.length > 0 && { images: attachment }),
            updatedBy: new Types.ObjectId(storeId),
        };

        const updatedProduct = await this.productRepository.findOneAndUpdate({
            filter: { _id: new Types.ObjectId(productId) },
            update: updates,
            options: { returnDocument: "after" }
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
                    freezedBy: new Types.ObjectId(storeId),
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
    async restoreProduct(productId: string, storeId: string) {
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
                    restoredAt: new Date(),
                    restoredBy: new Types.ObjectId(storeId),
                }
            }
        });

        if (restored.matchedCount === 0) {
            throw new NotFoundException("Product not found or failed to restore this resource");
        }
    }
}

export default new ProductService();
