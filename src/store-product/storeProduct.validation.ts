import { z } from "zod";
import { generalFields } from "../middleware/middleware.validation";

export const addProductToStoreSchema = {
    params: z.object({
        storeId: generalFields.id,
    }),
    body: z.strictObject({
        productId: generalFields.id,
        price: z.coerce
            .number()
            .min(0, { message: "Price must be greater than or equal to 0" }),
        stock: z.coerce
            .number()
            .int({ message: "Stock must be an integer" })
            .min(0, { message: "Stock must be greater than or equal to 0" }),
        isAvailable: z.boolean().optional().default(true),
    }),
};

export const updateStoreProductSchema = {
    params: z.object({
        storeId: generalFields.id,
        productId: generalFields.id,
    }),
    body: z
        .strictObject({
            price: z.coerce
                .number()
                .min(0, { message: "Price must be greater than or equal to 0" })
                .optional(),
            stock: z.coerce
                .number()
                .int({ message: "Stock must be an integer" })
                .min(0, { message: "Stock must be greater than or equal to 0" })
                .optional(),
            isAvailable: z.boolean().optional(),
        })
        .refine((data) => data.price !== undefined || data.stock !== undefined || data.isAvailable !== undefined, {
            message: "At least one field (price, stock, or isAvailable) must be provided",
        }),
};

export const getStoreProductsSchema = {
    params: z.object({
        storeId: generalFields.id,
    }),
};

export const getProductStoresSchema = {
    params: z.object({
        productId: generalFields.id,
    }),
};

export const removeProductFromStoreSchema = {
    params: z.object({
        storeId: generalFields.id,
        productId: generalFields.id,
    }),
};
