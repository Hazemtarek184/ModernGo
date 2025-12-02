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
const validators = __importStar(require("./Customer-Validation"));
const error_response_1 = require("../utils/error.response");
const success_response_1 = require("../utils/success.response");
const Customer_Service_1 = __importDefault(require("./Customer-Service"));
class CustomerController {
    constructor() { }
    registerCustomer = async (req, res) => {
        const validationResult = validators.registerCustomerSchema.body.safeParse(req.body);
        if (!validationResult.success) {
            throw new error_response_1.BadRequestException("Validation Error", {
                issues: JSON.parse(validationResult.error)
            });
        }
        const { confirmPassword, ...registerDto } = validationResult.data;
        const customer = await Customer_Service_1.default.registerCustomer(registerDto);
        return (0, success_response_1.successResponse)({
            res,
            statuscode: 201,
            data: { customer }
        });
    };
    loginCustomer = async (req, res) => {
        const validationResult = validators.loginCustomerSchema.body.safeParse(req.body);
        if (!validationResult.success) {
            throw new error_response_1.BadRequestException("Validation Error", {
                issues: JSON.parse(validationResult.error)
            });
        }
        const customer = await Customer_Service_1.default.loginCustomer(validationResult.data);
        return (0, success_response_1.successResponse)({
            res,
            statuscode: 200,
            data: { customer }
        });
    };
    getCustomerProfile = async (req, res) => {
        const { customerId } = req.params;
        if (!customerId) {
            throw new error_response_1.BadRequestException("Customer ID is required");
        }
        const customer = await Customer_Service_1.default.getCustomerProfile(customerId);
        return (0, success_response_1.successResponse)({
            res,
            statuscode: 200,
            data: { customer }
        });
    };
    updateCustomerProfile = async (req, res) => {
        const { customerId } = req.params;
        if (!customerId) {
            throw new error_response_1.BadRequestException("Customer ID is required");
        }
        const validationResult = validators.updateCustomerSchema.body.safeParse(req.body);
        if (!validationResult.success) {
            throw new error_response_1.BadRequestException("Validation Error", {
                issues: JSON.parse(validationResult.error)
            });
        }
        const updatedCustomer = await Customer_Service_1.default.updateCustomerProfile(customerId, validationResult.data);
        return (0, success_response_1.successResponse)({
            res,
            statuscode: 200,
            data: { customer: updatedCustomer }
        });
    };
    updatePassword = async (req, res) => {
        const { customerId } = req.params;
        if (!customerId) {
            throw new error_response_1.BadRequestException("Customer ID is required");
        }
        const validationResult = validators.updatePasswordSchema.body.safeParse(req.body);
        if (!validationResult.success) {
            throw new error_response_1.BadRequestException("Validation Error", {
                issues: JSON.parse(validationResult.error)
            });
        }
        const { confirmPassword, ...updatePasswordDto } = validationResult.data;
        const result = await Customer_Service_1.default.updatePassword(customerId, updatePasswordDto);
        return (0, success_response_1.successResponse)({
            res,
            statuscode: 200,
            data: result
        });
    };
}
exports.default = new CustomerController();
//# sourceMappingURL=Customer-Controller.js.map