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
const validators = __importStar(require("./Product-Validation"));
const error_response_1 = require("../utils/error.response");
const success_response_1 = require("../utils/success.response");
const Product_Service_1 = __importDefault(require("./Product-Service"));
var RoleEnum;
(function (RoleEnum) {
    RoleEnum["admin"] = "admin";
    RoleEnum["user"] = "user";
})(RoleEnum || (exports.RoleEnum = RoleEnum = {}));
class ProductController {
    constructor() { }
    createProduct = async (req, res) => {
        const validationResult = validators.createProductSchema.body.safeParse(req.body);
        if (!validationResult.success) {
            throw new error_response_1.BadRequestException("Validation Error", {
                issues: JSON.parse(validationResult.error)
            });
        }
        const { images, ...createProductDto } = validationResult.data;
        const files = req.files || [];
        const product = await Product_Service_1.default.createProduct(createProductDto, files);
        return (0, success_response_1.successResponse)({
            res,
            statuscode: 201,
            data: { product }
        });
    };
    updateProduct = async (req, res) => {
        const { productId } = req.params;
        if (!productId) {
            throw new error_response_1.BadRequestException("Product ID is required");
        }
        const validationResult = validators.createProductSchema.body.safeParse(req.body);
        if (!validationResult.success) {
            throw new error_response_1.BadRequestException("Validation Error", {
                issues: JSON.parse(validationResult.error)
            });
        }
        const { images, ...updateProductDto } = validationResult.data;
        const updatedProduct = await Product_Service_1.default.updateProduct(productId, updateProductDto);
        return (0, success_response_1.successResponse)({
            res,
            statuscode: 200,
            data: { updatedProduct }
        });
    };
    updateProductAttachment = async (req, res) => {
        const { productId } = req.params;
        if (!productId) {
            throw new error_response_1.BadRequestException("Missing productId in request params");
        }
        const files = req.files || [];
        const updatedProduct = await Product_Service_1.default.updateProductAttachment(productId, files, req.body);
        return (0, success_response_1.successResponse)({
            res,
            statuscode: 200,
            data: { updatedProduct },
        });
    };
    freezeProduct = async (req, res) => {
        const { productId } = req.params;
        if (!productId) {
            throw new error_response_1.BadRequestException("Product ID is required");
        }
        const result = await Product_Service_1.default.freezeProduct(productId);
        return (0, success_response_1.successResponse)({
            res,
            statuscode: 200,
            data: result
        });
    };
    restoreProduct = async (req, res) => {
        const { productId } = req.params;
        if (!productId) {
            throw new error_response_1.BadRequestException("Product ID is required");
        }
        await Product_Service_1.default.restoreProduct(productId);
        return (0, success_response_1.successResponse)({ res });
    };
}
exports.default = new ProductController();
//# sourceMappingURL=Product-Controller.js.map