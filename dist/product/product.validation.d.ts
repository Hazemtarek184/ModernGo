import { z } from 'zod';
export declare const createProductSchema: {
    body: z.ZodObject<{
        name: z.ZodString;
        slug: z.ZodOptional<z.ZodString>;
        description: z.ZodString;
        images: z.ZodOptional<z.ZodArray<z.ZodObject<{
            fieldname: z.ZodString;
            originalname: z.ZodString;
            encoding: z.ZodString;
            mimetype: z.ZodEnum<{
                [x: string]: string;
            }>;
            buffer: z.ZodOptional<z.ZodAny>;
            path: z.ZodOptional<z.ZodAny>;
            size: z.ZodNumber;
        }, z.core.$strict>>>;
        discountPercent: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        mainPrice: z.ZodCoercedNumber<unknown>;
        stock: z.ZodCoercedNumber<unknown>;
    }, z.core.$strict>;
};
export declare const freezeAccount: {
    params: z.ZodOptional<z.ZodObject<{
        productId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
};
export declare const restoreAccount: {
    params: z.ZodObject<{
        userId: z.ZodString;
    }, z.core.$strip>;
};
export declare const hardDeleteAccount: {
    params: z.ZodObject<{
        userId: z.ZodString;
    }, z.core.$strip>;
};
//# sourceMappingURL=product.validation.d.ts.map