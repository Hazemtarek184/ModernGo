"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const StoreProduct_Module_1 = require("./StoreProduct-Module");
const StoreProduct_Repository_1 = require("../DB/repository/StoreProduct-Repository");
const Product_Module_1 = require("../product/Product-Module");
const Store_Module_1 = require("../store/Store-Module");
const error_response_1 = require("../utils/error.response");
class StoreProductService {
    storeProductRepository = new StoreProduct_Repository_1.StoreProductRepository(StoreProduct_Module_1.StoreProductModel);
    constructor() { }
    async addProductToStore(storeId, productId, price, stock, isAvailable = true) {
        const store = await Store_Module_1.storeModel.findById(storeId);
        if (!store) {
            throw new error_response_1.NotFoundException("Store not found");
        }
        const product = await Product_Module_1.ProductModel.findById(productId);
        if (!product) {
            throw new error_response_1.NotFoundException("Product not found");
        }
        const [storeProduct] = await this.storeProductRepository.create({
            data: [
                {
                    storeId: new mongoose_1.Types.ObjectId(storeId),
                    productId: new mongoose_1.Types.ObjectId(productId),
                    price,
                    stock,
                    isAvailable,
                },
            ],
        });
        if (!storeProduct) {
            throw new error_response_1.BadRequestException("Failed to add product to store");
        }
        return storeProduct;
    }
    async getStoreProducts(storeId) {
        const store = await Store_Module_1.storeModel.findById(storeId);
        if (!store) {
            throw new error_response_1.NotFoundException("Store not found");
        }
        const storeProducts = await this.storeProductRepository.find({
            filter: { storeId: new mongoose_1.Types.ObjectId(storeId) },
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
    async getProductStores(productId) {
        const product = await Product_Module_1.ProductModel.findById(productId);
        if (!product) {
            throw new error_response_1.NotFoundException("Product not found");
        }
        const productStores = await this.storeProductRepository.find({
            filter: { productId: new mongoose_1.Types.ObjectId(productId) },
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
    async updateStoreProduct(storeId, productId, updates) {
        const updatedStoreProduct = await this.storeProductRepository.findOneAndUpdate({
            filter: {
                storeId: new mongoose_1.Types.ObjectId(storeId),
                productId: new mongoose_1.Types.ObjectId(productId),
            },
            update: updates,
            options: { new: true },
        });
        if (!updatedStoreProduct) {
            throw new error_response_1.NotFoundException("Store-Product relationship not found");
        }
        return updatedStoreProduct;
    }
    async removeProductFromStore(storeId, productId) {
        const deletedStoreProduct = await this.storeProductRepository.findOneAndDelete({
            filter: {
                storeId: new mongoose_1.Types.ObjectId(storeId),
                productId: new mongoose_1.Types.ObjectId(productId),
            },
        });
        if (!deletedStoreProduct) {
            throw new error_response_1.NotFoundException("Store-Product relationship not found");
        }
        return deletedStoreProduct;
    }
}
exports.default = new StoreProductService();
//# sourceMappingURL=StoreProduct-Service.js.map