"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Product_Module_1 = require("./Product-Module");
const repository_1 = require("../DB/repository");
const error_response_1 = require("../utils/error.response");
const uuid_1 = require("uuid");
const s3_config_1 = require("../utils/s3.config");
const cloud_multer_1 = require("../utils/cloud.multer");
const slugify_1 = __importDefault(require("slugify"));
class ProductService {
    productRepository = new repository_1.ProductRepository(Product_Module_1.ProductModel);
    constructor() { }
    async createProduct(dto, files) {
        const assistFolderId = (0, uuid_1.v4)();
        const images = await (0, s3_config_1.uploadFiles)({
            storageApproach: cloud_multer_1.StorageEnum.memory,
            files,
            path: `products/${assistFolderId}`,
            useLarge: true
        });
        const salePrice = dto.mainPrice - (dto.mainPrice * ((dto.discountPercent ?? 0) / 100));
        const slug = (0, slugify_1.default)(dto.name, { lower: true, strict: true });
        const [product] = await this.productRepository.create({
            data: [{
                    ...dto,
                    assistFolderId,
                    images,
                    salePrice,
                    slug,
                }]
        });
        if (!product) {
            throw new error_response_1.BadRequestException("Failed to create this product instance");
        }
        return product;
    }
    async updateProduct(productId, dto) {
        if (!mongoose_1.Types.ObjectId.isValid(productId)) {
            throw new error_response_1.BadRequestException("Invalid productId format");
        }
        const product = await Product_Module_1.ProductModel.findById(productId);
        if (!product) {
            throw new error_response_1.NotFoundException("Failed to find matching product instance");
        }
        let salePrice = product.salePrice;
        if (dto.mainPrice !== undefined || dto.discountPercent !== undefined) {
            const mainPrice = dto.mainPrice ?? product.mainPrice;
            const discountPercent = dto.discountPercent ?? product.discountPercent;
            const finalPrice = mainPrice - (mainPrice * (discountPercent / 100));
            salePrice = finalPrice > 0 ? finalPrice : 1;
        }
        const slug = dto.name ? (0, slugify_1.default)(dto.name, { lower: true, strict: true }) : undefined;
        const updatedProduct = await this.productRepository.findOneAndUpdate({
            filter: { _id: new mongoose_1.Types.ObjectId(productId) },
            update: {
                ...dto,
                ...(slug && { slug }),
                salePrice,
            },
            options: { new: true }
        });
        if (!updatedProduct) {
            throw new error_response_1.BadRequestException("Failed to update this product instance");
        }
        return updatedProduct;
    }
    async updateProductAttachment(productId, files, updateData) {
        if (!mongoose_1.Types.ObjectId.isValid(productId)) {
            throw new error_response_1.BadRequestException("Invalid productId format");
        }
        const product = await Product_Module_1.ProductModel.findById(productId);
        if (!product) {
            throw new error_response_1.NotFoundException("Failed to find matching product instance");
        }
        let attachment = [];
        if (files.length > 0) {
            attachment = await (0, s3_config_1.uploadFiles)({
                files,
                path: `products/${product.assistFolderId}`,
            });
        }
        const updates = {
            ...updateData,
            ...(attachment.length > 0 && { images: attachment }),
        };
        const updatedProduct = await this.productRepository.findOneAndUpdate({
            filter: { _id: new mongoose_1.Types.ObjectId(productId) },
            update: updates,
            options: { new: true }
        });
        if (!updatedProduct) {
            throw new error_response_1.BadRequestException("Failed to update this product instance");
        }
        return updatedProduct;
    }
    async freezeProduct(productId) {
        if (!mongoose_1.Types.ObjectId.isValid(productId)) {
            throw new error_response_1.BadRequestException("Invalid productId format");
        }
        const updated = await this.productRepository.updateOne({
            filter: {
                _id: new mongoose_1.Types.ObjectId(productId),
                freezedAt: { $exists: false }
            },
            update: {
                $set: {
                    freezedAt: new Date(),
                    changeCredentialsTime: new Date(),
                }
            }
        });
        if (updated.matchedCount === 0) {
            throw new error_response_1.NotFoundException("Product not found or already frozen");
        }
        return { productId };
    }
    async restoreProduct(productId) {
        if (!mongoose_1.Types.ObjectId.isValid(productId)) {
            throw new error_response_1.BadRequestException("Invalid productId format");
        }
        const restored = await this.productRepository.updateOne({
            filter: {
                _id: new mongoose_1.Types.ObjectId(productId),
                freezedAt: { $exists: true }
            },
            update: {
                $unset: {
                    freezedAt: 1,
                    freezedBy: 1
                },
                $set: {
                    restoreAt: new Date(),
                }
            }
        });
        if (restored.matchedCount === 0) {
            throw new error_response_1.NotFoundException("Product not found or failed to restore this resource");
        }
    }
}
exports.default = new ProductService();
//# sourceMappingURL=Product-Service.js.map