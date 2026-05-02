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
        }),
    ingredients: z.array(z.string()).optional(),

    nutrients: z.object({
        calories: z.coerce.number().optional(),
        sugar_g: z.coerce.number().optional(),
        sodium_mg: z.coerce.number().optional(),
        fat_g: z.coerce.number().optional(),
    }).optional(),

    additives: z.array(z.string()).optional(),
    allergens: z.array(z.string()).optional(),
    drugInteractions: z.array(z.string()).optional(),
    warnings: z.array(z.string()).optional(),
}

export const hardDeleteAccount = restoreAccount;

export const getAllProductsSchema = {
    query: z.strictObject({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(10),
        search: z.string().optional(),
        minPrice: z.coerce.number().min(0).optional(),
        maxPrice: z.coerce.number().min(0).optional(),
        sortBy: z.enum(['createdAt', 'mainPrice', 'salePrice', 'name']).default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
    })
};
