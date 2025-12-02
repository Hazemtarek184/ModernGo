"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeProductFromStoreSchema = exports.getProductStoresSchema = exports.getStoreProductsSchema = exports.updateStoreProductSchema = exports.addProductToStoreSchema = void 0;
const zod_1 = require("zod");
const middleware_Validation_1 = require("../middleware/middleware-Validation");
exports.addProductToStoreSchema = {
    params: zod_1.z.object({
        storeId: middleware_Validation_1.generalFields.id,
    }),
    body: zod_1.z.strictObject({
        productId: middleware_Validation_1.generalFields.id,
        price: zod_1.z.coerce
            .number()
            .min(0, { message: "Price must be greater than or equal to 0" }),
        stock: zod_1.z.coerce
            .number()
            .int({ message: "Stock must be an integer" })
            .min(0, { message: "Stock must be greater than or equal to 0" }),
        isAvailable: zod_1.z.boolean().optional().default(true),
    }),
};
exports.updateStoreProductSchema = {
    params: zod_1.z.object({
        storeId: middleware_Validation_1.generalFields.id,
        productId: middleware_Validation_1.generalFields.id,
    }),
    body: zod_1.z
        .strictObject({
        price: zod_1.z.coerce
            .number()
            .min(0, { message: "Price must be greater than or equal to 0" })
            .optional(),
        stock: zod_1.z.coerce
            .number()
            .int({ message: "Stock must be an integer" })
            .min(0, { message: "Stock must be greater than or equal to 0" })
            .optional(),
        isAvailable: zod_1.z.boolean().optional(),
    })
        .refine((data) => data.price !== undefined || data.stock !== undefined || data.isAvailable !== undefined, {
        message: "At least one field (price, stock, or isAvailable) must be provided",
    }),
};
exports.getStoreProductsSchema = {
    params: zod_1.z.object({
        storeId: middleware_Validation_1.generalFields.id,
    }),
};
exports.getProductStoresSchema = {
    params: zod_1.z.object({
        productId: middleware_Validation_1.generalFields.id,
    }),
};
exports.removeProductFromStoreSchema = {
    params: zod_1.z.object({
        storeId: middleware_Validation_1.generalFields.id,
        productId: middleware_Validation_1.generalFields.id,
    }),
};
//# sourceMappingURL=StoreProduct-Validation.js.map