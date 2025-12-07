"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePasswordSchema = exports.getCustomerSchema = exports.updateCustomerSchema = exports.loginCustomerSchema = exports.registerCustomerSchema = void 0;
const zod_1 = require("zod");
const middleware_Validation_1 = require("../middleware/middleware-Validation");
const addressSchema = zod_1.z.object({
    street: zod_1.z.string().min(2).max(100).optional(),
    city: zod_1.z.string().min(2).max(50).optional(),
    state: zod_1.z.string().min(2).max(50).optional(),
    postalCode: zod_1.z.string().min(2).max(20).optional(),
    country: zod_1.z.string().min(2).max(50).optional(),
}).optional();
exports.registerCustomerSchema = {
    body: zod_1.z.object({
        firstName: zod_1.z.string()
            .min(2, { message: "First name must be at least 2 characters" })
            .max(50, { message: "First name must not exceed 50 characters" }),
        lastName: zod_1.z.string()
            .min(2, { message: "Last name must be at least 2 characters" })
            .max(50, { message: "Last name must not exceed 50 characters" }),
        email: middleware_Validation_1.generalFields.email,
        phone: middleware_Validation_1.generalFields.phone,
        password: middleware_Validation_1.generalFields.password,
        confirmPassword: middleware_Validation_1.generalFields.confirmPassword,
        address: addressSchema,
    }).refine(data => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"]
    }),
    file: zod_1.z.object({
        fieldname: zod_1.z.literal('profilePhoto'),
        mimetype: zod_1.z.enum(['image/jpeg', 'image/jpg', 'image/png', 'image/gif']),
    })
};
exports.loginCustomerSchema = {
    body: zod_1.z.object({
        email: middleware_Validation_1.generalFields.email,
        password: zod_1.z.string().min(1, "Password is required"),
    })
};
exports.updateCustomerSchema = {
    params: zod_1.z.object({
        customerId: middleware_Validation_1.generalFields.id,
    }),
    body: zod_1.z.object({
        firstName: zod_1.z.string()
            .min(2, { message: "First name must be at least 2 characters" })
            .max(50, { message: "First name must not exceed 50 characters" })
            .optional(),
        lastName: zod_1.z.string()
            .min(2, { message: "Last name must be at least 2 characters" })
            .max(50, { message: "Last name must not exceed 50 characters" })
            .optional(),
        phone: middleware_Validation_1.generalFields.phone.optional(),
        address: addressSchema,
    })
};
exports.getCustomerSchema = {
    params: zod_1.z.object({
        customerId: middleware_Validation_1.generalFields.id,
    })
};
exports.updatePasswordSchema = {
    params: zod_1.z.object({
        customerId: middleware_Validation_1.generalFields.id,
    }),
    body: zod_1.z.object({
        currentPassword: zod_1.z.string().min(1, "Current password is required"),
        newPassword: middleware_Validation_1.generalFields.password,
        confirmPassword: middleware_Validation_1.generalFields.confirmPassword,
    }).refine(data => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"]
    })
};
//# sourceMappingURL=Customer-Validation.js.map