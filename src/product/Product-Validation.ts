import { z } from 'zod';
import { fileValidation } from '../utils/cloud.multer';
import { generalFields } from '../middleware/middleware-Validation';
import { Types } from 'mongoose';

export const createProductSchema = {
    body: z
        .strictObject({

            name: z.string()
                .min(2, { message: "min product name is 2" })
                .max(2000, { message: "max product name is 2000" }),

            slug: z.string()
                .min(2, { message: "min slug product is 2" })
                .max(50, { message: "max slug product is 50" })
                .optional(),

            description: z.string()
                .min(2, { message: "min product description is 2" })
                .max(5000, { message: "max product description is 5000" }),

            images: z.array(generalFields.file(fileValidation.image)).max(2).optional(),

            discountPercent: z.coerce.number().default(0),
            mainPrice: z.coerce.number(),
            stock: z.coerce.number(),
        })

};

export const freezeAccount = {
    params: z.object({
        productId: z.string().optional()
    })
        .optional()
        .refine(data => {
            return data?.productId ? Types.ObjectId.isValid(data.productId) : true

        }, {
            error: "Invalid objectId format",
            path: ["userId"]
        })
}

export const restoreAccount = {
    params: z.object({
        userId: z.string()
    })

        .refine(data => {
            return Types.ObjectId.isValid(data.userId)

        }, {
            error: "Invalid objectId format",
            path: ["userId"]
        })
}

export const hardDeleteAccount = restoreAccount;
