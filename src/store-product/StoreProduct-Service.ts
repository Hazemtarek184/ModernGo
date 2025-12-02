import { Types } from "mongoose";
import { StoreProductModel } from "./StoreProduct-Module";
import { StoreProductRepository } from "../DB/repository/StoreProduct-Repository";
import { ProductModel } from "../product/Product-Module";
import { storeModel } from "../store/Store-Module";
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
        const store = await storeModel.findById(storeId);
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
        const store = await storeModel.findById(storeId);
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
                    },
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
            options: { new: true },
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
}

export default new StoreProductService();
