"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hardDeleteAccount = exports.restoreAccount = exports.freezeAccount = exports.createProductSchema = void 0;
const zod_1 = require("zod");
const cloud_multer_1 = require("../utils/cloud.multer");
const middleware_Validation_1 = require("../middleware/middleware-Validation");
const mongoose_1 = require("mongoose");
exports.createProductSchema = {
    body: zod_1.z
        .strictObject({
        name: zod_1.z.string()
            .min(2, { message: "min product name is 2" })
            .max(2000, { message: "max product name is 2000" }),
        slug: zod_1.z.string()
            .min(2, { message: "min slug product is 2" })
            .max(50, { message: "max slug product is 50" })
            .optional(),
        description: zod_1.z.string()
            .min(2, { message: "min product description is 2" })
            .max(5000, { message: "max product description is 5000" }),
        images: zod_1.z.array(middleware_Validation_1.generalFields.file(cloud_multer_1.fileValidation.image)).max(2).optional(),
        discountPercent: zod_1.z.coerce.number().default(0),
        mainPrice: zod_1.z.coerce.number(),
        stock: zod_1.z.coerce.number(),
    })
};
exports.freezeAccount = {
    params: zod_1.z.object({
        productId: zod_1.z.string().optional()
    })
        .optional()
        .refine(data => {
        return data?.productId ? mongoose_1.Types.ObjectId.isValid(data.productId) : true;
    }, {
        error: "Invalid objectId format",
        path: ["userId"]
    })
};
exports.restoreAccount = {
    params: zod_1.z.object({
        userId: zod_1.z.string()
    })
        .refine(data => {
        return mongoose_1.Types.ObjectId.isValid(data.userId);
    }, {
        error: "Invalid objectId format",
        path: ["userId"]
    })
};
exports.hardDeleteAccount = exports.restoreAccount;
//# sourceMappingURL=Product-Validation.js.map