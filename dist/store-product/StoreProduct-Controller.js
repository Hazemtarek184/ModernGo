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
const validators = __importStar(require("./StoreProduct-Validation"));
const error_response_1 = require("../utils/error.response");
const success_response_1 = require("../utils/success.response");
const StoreProduct_Service_1 = __importDefault(require("./StoreProduct-Service"));
class StoreProductController {
    constructor() { }
    addProductToStore = async (req, res) => {
        const validationResult = validators.addProductToStoreSchema.body.safeParse(req.body);
        if (!validationResult.success) {
            throw new error_response_1.BadRequestException("Validation Error", {
                issues: JSON.parse(validationResult.error),
            });
        }
        const { storeId } = req.params;
        if (!storeId) {
            throw new error_response_1.BadRequestException("Store ID is required");
        }
        const { productId, price, stock, isAvailable } = validationResult.data;
        const storeProduct = await StoreProduct_Service_1.default.addProductToStore(storeId, productId, price, stock, isAvailable);
        return (0, success_response_1.successResponse)({
            res,
            statuscode: 201,
            message: "Product added to store successfully",
            data: { storeProduct },
        });
    };
    getStoreProducts = async (req, res) => {
        const { storeId } = req.params;
        if (!storeId) {
            throw new error_response_1.BadRequestException("Store ID is required");
        }
        const storeProducts = await StoreProduct_Service_1.default.getStoreProducts(storeId);
        return (0, success_response_1.successResponse)({
            res,
            statuscode: 200,
            data: { storeProducts, count: storeProducts.length },
        });
    };
    getProductStores = async (req, res) => {
        const { productId } = req.params;
        if (!productId) {
            throw new error_response_1.BadRequestException("Product ID is required");
        }
        const productStores = await StoreProduct_Service_1.default.getProductStores(productId);
        return (0, success_response_1.successResponse)({
            res,
            statuscode: 200,
            data: { productStores, count: productStores.length },
        });
    };
    updateStoreProduct = async (req, res) => {
        const validationResult = validators.updateStoreProductSchema.body.safeParse(req.body);
        if (!validationResult.success) {
            throw new error_response_1.BadRequestException("Validation Error", {
                issues: JSON.parse(validationResult.error),
            });
        }
        const { storeId, productId } = req.params;
        if (!storeId || !productId) {
            throw new error_response_1.BadRequestException("Store ID and Product ID are required");
        }
        const updates = validationResult.data;
        const updatedStoreProduct = await StoreProduct_Service_1.default.updateStoreProduct(storeId, productId, updates);
        return (0, success_response_1.successResponse)({
            res,
            statuscode: 200,
            message: "Store product updated successfully",
            data: { updatedStoreProduct },
        });
    };
    removeProductFromStore = async (req, res) => {
        const { storeId, productId } = req.params;
        if (!storeId || !productId) {
            throw new error_response_1.BadRequestException("Store ID and Product ID are required");
        }
        await StoreProduct_Service_1.default.removeProductFromStore(storeId, productId);
        return (0, success_response_1.successResponse)({
            res,
            statuscode: 200,
            message: "Product removed from store successfully",
        });
    };
}
exports.default = new StoreProductController();
//# sourceMappingURL=StoreProduct-Controller.js.map