"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticateCustomer = void 0;
const jwt_utils_1 = require("../utils/jwt.utils");
const error_response_1 = require("../utils/error.response");
const Customer_Repository_1 = require("../DB/repository/Customer-Repository");
const Customer_Module_1 = require("../customer/Customer-Module");
const mongoose_1 = require("mongoose");
const authenticateCustomer = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new error_response_1.UnauthorizedException('No token provided');
        }
        const token = authHeader.substring(7);
        const payload = (0, jwt_utils_1.verifyToken)(token);
        const customerRepository = new Customer_Repository_1.CustomerRepository(Customer_Module_1.CustomerModel);
        const customer = await customerRepository.findOne({
            filter: { _id: new mongoose_1.Types.ObjectId(payload.customerId) }
        });
        if (!customer) {
            throw new error_response_1.UnauthorizedException('Customer no longer exists');
        }
        req.customer = {
            customerId: payload.customerId,
            email: payload.email
        };
        next();
    }
    catch (error) {
        if (error instanceof error_response_1.UnauthorizedException) {
            throw error;
        }
        throw new error_response_1.UnauthorizedException('Invalid or expired token');
    }
};
exports.authenticateCustomer = authenticateCustomer;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const payload = (0, jwt_utils_1.verifyToken)(token);
            req.customer = {
                customerId: payload.customerId,
                email: payload.email
            };
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.middleware.js.map