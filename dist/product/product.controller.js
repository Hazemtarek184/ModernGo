"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleEnum = void 0;
const validators = __importStar(require("./product.validation"));
const error_response_1 = require("../utils/error.response");
const repository_1 = require("../DB/repository");
const product_module_1 = require("./product.module");
const uuid_1 = require("uuid");
const s3_config_1 = require("../utils/s3.config");
const cloud_multer_1 = require("../utils/cloud.multer");
const slugify_1 = __importDefault(require("slugify"));
const success_response_1 = require("../utils/success.response");
const mongoose_1 = require("mongoose");
var RoleEnum;
(function (RoleEnum) {
    RoleEnum["admin"] = "admin";
    RoleEnum["user"] = "user";
})(RoleEnum || (exports.RoleEnum = RoleEnum = {}));
class ProductController {
    productModel = new repository_1.ProductRepository(product_module_1.ProductModel);
    userModel;
    constructor() { }
    createProduct = async (req, res) => {
        const validationResult = validators.createProductSchema.body.safeParse(req.body);
        if (!validationResult.success) {
            throw new error_response_1.BadRequestException("validation Error", {
                issues: JSON.parse(validationResult.error)
            });
        }
        const createProductDto = validationResult.data;
        const assistFolderId = (0, uuid_1.v4)();
        const files = req.files || [];
        const images = await (0, s3_config_1.uploadFiles)({
            storageApproach: cloud_multer_1.StorageEnum.memory,
            files,
            path: `products/${assistFolderId}`,
            useLarge: true
        });
        const salePrice = createProductDto.mainPrice - (createProductDto.mainPrice * ((createProductDto.discountPercent ?? 0) / 100));
        createProductDto.slug = (0, slugify_1.default)(createProductDto.name, { lower: true, strict: true });
        const [product] = await this.productModel.create({
            data: [{
                    ...createProductDto,
                    assistFolderId,
                    images,
                    salePrice,
                }]
        });
        if (!product) {
            throw new error_response_1.BadRequestException("Fail to create this product instance");
        }
        return (0, success_response_1.successResponse)({ res, statuscode: 201, data: { product } });
    };
    updateProduct = async (req, res) => {
        const { _id } = req.params;
        const validationResult = validators.createProductSchema.body.safeParse(req.body);
        if (!validationResult.success) {
            throw new error_response_1.BadRequestException("validation Error", {
                issues: JSON.parse(validationResult.error)
            });
        }
        const updateProductDto = validationResult.data;
        const product = await this.productModel.findOne({
            filter: { productId: _id }
        });
        if (!product) {
            throw new error_response_1.NotFoundException("fail to find matching product instance");
        }
        let salePrice = product.salePrice;
        if (updateProductDto.mainPrice || updateProductDto.discountPercent) {
            const mainPrice = updateProductDto.mainPrice ?? product.mainPrice;
            const discountPercent = updateProductDto.discountPercent ?? product.discountPercent;
            const finalPrice = mainPrice - (mainPrice * (discountPercent / 100));
            salePrice = finalPrice > 0 ? finalPrice : 1;
        }
        updateProductDto.slug = (0, slugify_1.default)(updateProductDto.name, { lower: true, strict: true });
        const updatedProduct = await this.productModel.findOneAndUpdate({
            filter: { productId: _id },
            update: {
                ...updateProductDto,
                salePrice,
            }
        });
        if (!updatedProduct) {
            throw new error_response_1.BadRequestException("fail to update this product instance");
        }
        return (0, success_response_1.successResponse)({ res, statuscode: 201, data: { updatedProduct } });
    };
    updateProductAttachment = async (req, res) => {
        const { productId } = req.params;
        if (!productId) {
            throw new error_response_1.BadRequestException("Missing productId in request params");
        }
        const files = req.files || [];
        const product = await this.productModel.findOne({
            filter: { _id: productId }
        });
        if (!product) {
            throw new error_response_1.NotFoundException("Failed to find matching product instance");
        }
        let attachment = [];
        if (files.length > 0) {
            attachment = await (0, s3_config_1.uploadFiles)({
                files,
                path: product._id.toString(),
            });
        }
        const updateProduct = {
            ...req.body,
            ...(attachment.length > 0 && { attachment }),
        };
        const updatedProduct = await this.productModel.findOneAndUpdate({
            filter: { _id: productId },
            update: updateProduct,
            options: { new: true }
        });
        if (!updatedProduct) {
            throw new error_response_1.BadRequestException("Failed to update this product instance");
        }
        return (0, success_response_1.successResponse)({
            res,
            statuscode: 200,
            data: { updatedProduct },
        });
    };
    freezeProduct = async (req, res) => {
        const { productId } = req.params;
        if (!productId) {
            throw new error_response_1.NotFoundException("Product ID is required");
        }
        if (!mongoose_1.Types.ObjectId.isValid(productId)) {
            throw new error_response_1.BadRequestException("Invalid productId format");
        }
        const updated = await product_module_1.ProductModel.updateOne({
            _id: productId,
            freezedAt: { $exists: false }
        }, {
            $set: {
                freezedAt: new Date(),
                changeCredentialsTime: new Date(),
            }
        });
        if (updated.matchedCount === 0) {
            throw new error_response_1.NotFoundException("Product not found or already frozen");
        }
        return (0, success_response_1.successResponse)({
            res,
            statuscode: 200,
            data: { productId }
        });
    };
    restoreProduct = async (req, res) => {
        const { productId } = req.params;
        const restore = await product_module_1.ProductModel.updateOne({ _id: productId, freezedAt: { $exists: true } }, {
            $unset: {
                freezedAt: 1,
                freezedBy: 1
            },
            $set: {
                restoreAt: new Date(),
            }
        });
        if (restore.matchedCount === 0) {
            throw new error_response_1.NotFoundException("not found product or fail to restore this resource");
        }
        return (0, success_response_1.successResponse)({ res });
    };
    hardDeleteProduct = async (req, res) => {
        const { productId } = req.params;
        const product = await this.productModel.deleteOne({
            filter: {
                _id: productId,
                freezedBy: { $ne: productId }
            },
        });
        if (!product.deletedCount) {
            throw new error_response_1.NotFoundException("user not found or fail to hard delete this resource");
        }
        await (0, s3_config_1.deleteFolderByPrefix)({ path: `/user${productId}` });
        return (0, success_response_1.successResponse)({ res });
    };
}
exports.default = new ProductController();
//# sourceMappingURL=product.controller.js.map