import { Types, PipelineStage } from "mongoose";
import { StoreProductModel } from "./StoreProduct-Module";
import { StoreProductRepository } from "../DB/repository/StoreProduct-Repository";
import { ProductModel } from "../product/Product-Module";
import { StoreModel } from "../store/Store-Module";
import { BadRequestException, NotFoundException } from "../utils/error.response";

class StoreProductService {
    private storeProductRepository = new StoreProductRepository(StoreProductModel as any);

    constructor() { }

    /**
     * Add a product to a store with specific price and stock
     */
    async addProductToStore(
        storeId: string,
        productId: string,
        price: number,
        stock: number,
        isAvailable: boolean = true
    ) {
        // Validate that both store and product exist
        const store = await StoreModel.findById(storeId);
        if (!store) {
            throw new NotFoundException("Store not found");
        }

        const product = await ProductModel.findById(productId);
        if (!product) {
            throw new NotFoundException("Product not found");
        }

        // Create the store-product relationship
        const [storeProduct] = await this.storeProductRepository.create({
            data: [
                {
                    storeId: new Types.ObjectId(storeId),
                    productId: new Types.ObjectId(productId),
                    price,
                    stock,
                    isAvailable,
                },
            ],
        });

        if (!storeProduct) {
            throw new BadRequestException("Failed to add product to store");
        }

        return storeProduct;
    }

    /**
     * Get all products in a specific store
     */
    async getStoreProducts(storeId: string) {
        // Validate store exists
        const store = await StoreModel.findById(storeId);
        if (!store) {
            throw new NotFoundException("Store not found");
        }

        const storeProducts = await this.storeProductRepository.find({
            filter: { storeId: new Types.ObjectId(storeId) },
            options: {
                populate: [
                    {
                        path: "productId",
                        model: "Product",
                    },
                    {
                        path: "storeId",
                        model: "Store",
                        select: "name email profilePhoto address phone location categories"
                    }
                ],
            },
        });

        return storeProducts;
    }

    /**
     * Get all stores that sell a specific product
     */
    async getProductStores(productId: string) {
        // Validate product exists
        const product = await ProductModel.findById(productId);
        if (!product) {
            throw new NotFoundException("Product not found");
        }

        const productStores = await this.storeProductRepository.find({
            filter: { productId: new Types.ObjectId(productId) },
            options: {
                populate: [
                    {
                        path: "storeId",
                        model: "Store",
                        select: "name email profilePhoto address phone location categories"
                    },
                    {
                        path: "productId",
                        model: "Product"
                    }
                ],
            },
        });

        return productStores;
    }

    /**
     * Update store-specific product details (price, stock, availability)
     */
    async updateStoreProduct(
        storeId: string,
        productId: string,
        updates: {
            price?: number | undefined;
            stock?: number | undefined;
            isAvailable?: boolean | undefined;
        }
    ) {
        const updatedStoreProduct = await this.storeProductRepository.findOneAndUpdate({
            filter: {
                storeId: new Types.ObjectId(storeId),
                productId: new Types.ObjectId(productId),
            },
            update: updates,
            options: { returnDocument: "after" },
        });

        if (!updatedStoreProduct) {
            throw new NotFoundException(
                "Store-Product relationship not found"
            );
        }

        return updatedStoreProduct;
    }

    /**
     * Remove a product from a store
     */
    async removeProductFromStore(storeId: string, productId: string) {
        const deletedStoreProduct = await this.storeProductRepository.findOneAndDelete({
            filter: {
                storeId: new Types.ObjectId(storeId),
                productId: new Types.ObjectId(productId),
            },
        });

        if (!deletedStoreProduct) {
            throw new NotFoundException(
                "Store-Product relationship not found"
            );
        }

        return deletedStoreProduct;
    }

    // ─── Nearby Query Methods ────────────────────────────────────

    /**
     * Escape special regex characters in a string
     */
    private escapeRegex(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Build the shared aggregation pipeline for nearby store-product queries
     */
    private buildNearbyPipeline(
        productFilter: Record<string, unknown>,
        longitude: number,
        latitude: number,
        maxDistance: number
    ): PipelineStage[] {
        return [
            // Stage 1: Find nearby stores sorted by distance (must be first stage) 
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [longitude, latitude] },
                    distanceField: "distance",
                    maxDistance: maxDistance,
                    spherical: true,
                },
            },
            // Stage 2: Exclude password from results
            {
                $project: {
                    password: 0,
                    __v: 0,
                    createdAt: 0,
                    updatedAt: 0,
                },
            },
            // Stage 3: Join with StoreProduct collection
            {
                $lookup: {
                    from: "storeproducts",
                    let: { storeId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$storeId", "$$storeId"] },
                                isAvailable: true,
                                ...productFilter,
                            },
                        },
                        // Join product details for each matched store-product
                        {
                            $lookup: {
                                from: "products",
                                localField: "productId",
                                foreignField: "_id",
                                as: "product",
                            },
                        },
                        { $unwind: "$product" },
                        // Only include non-frozen products
                        {
                            $match: {
                                "product.freezedAt": { $exists: false },
                            },
                        },
                        // Shape the product output
                        {
                            $project: {
                                _id: 0,
                                productId: "$productId",
                                productName: "$product.name",
                                price: 1,
                                stock: 1,
                                isAvailable: 1,
                            },
                        },
                    ],
                    as: "products",
                },
            },
            // Stage 4: Only keep stores that have at least one matching product
            {
                $match: {
                    "products.0": { $exists: true },
                },
            },
        ];
    }

    /**
     * Find nearby stores that sell a specific product (by product ID)
     */
    async getNearbyStoresForProduct(
        productId: string,
        longitude: number,
        latitude: number,
        maxDistance: number = 5000
    ) {
        // Validate product exists
        const product = await ProductModel.findById(productId);
        if (!product) {
            throw new NotFoundException("Product not found");
        }

        const pipeline = this.buildNearbyPipeline(
            { productId: new Types.ObjectId(productId) },
            longitude,
            latitude,
            maxDistance
        );

        return await StoreModel.aggregate(pipeline);
    }

    /**
     * Search for nearby stores selling products matching a name query
     */
    async searchNearbyStoresForProduct(
        query: string,
        longitude: number,
        latitude: number,
        maxDistance: number = 5000
    ) {
        // Find product IDs matching the search query
        const matchingProducts = await ProductModel.find(
            {
                name: { $regex: this.escapeRegex(query), $options: 'i' },
                freezedAt: { $exists: false },
            },
            { _id: 1 }
        ).lean();

        if (matchingProducts.length === 0) {
            return [];
        }

        const productIds = matchingProducts.map(p => p._id);

        const pipeline = this.buildNearbyPipeline(
            { productId: { $in: productIds } },
            longitude,
            latitude,
            maxDistance
        );

        return await StoreModel.aggregate(pipeline);
    }
}

export default new StoreProductService();
