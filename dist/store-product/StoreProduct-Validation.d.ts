import { z } from "zod";
export declare const addProductToStoreSchema: {
    params: z.ZodObject<{
        storeId: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        productId: z.ZodString;
        price: z.ZodCoercedNumber<unknown>;
        stock: z.ZodCoercedNumber<unknown>;
        isAvailable: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, z.core.$strict>;
};
export declare const updateStoreProductSchema: {
    params: z.ZodObject<{
        storeId: z.ZodString;
        productId: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        price: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        stock: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        isAvailable: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strict>;
};
export declare const getStoreProductsSchema: {
    params: z.ZodObject<{
        storeId: z.ZodString;
    }, z.core.$strip>;
};
export declare const getProductStoresSchema: {
    params: z.ZodObject<{
        productId: z.ZodString;
    }, z.core.$strip>;
};
export declare const removeProductFromStoreSchema: {
    params: z.ZodObject<{
        storeId: z.ZodString;
        productId: z.ZodString;
    }, z.core.$strip>;
};
//# sourceMappingURL=StoreProduct-Validation.d.ts.map