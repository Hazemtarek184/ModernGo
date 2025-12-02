import { z } from 'zod';
export declare const registerCustomerSchema: {
    body: z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
        phone: z.ZodUnion<readonly [z.ZodString, z.ZodString]>;
        password: z.ZodString;
        confirmPassword: z.ZodString;
        address: z.ZodOptional<z.ZodObject<{
            street: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
            state: z.ZodOptional<z.ZodString>;
            postalCode: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
};
export declare const loginCustomerSchema: {
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, z.core.$strip>;
};
export declare const updateCustomerSchema: {
    params: z.ZodObject<{
        customerId: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        firstName: z.ZodOptional<z.ZodString>;
        lastName: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodString]>>;
        address: z.ZodOptional<z.ZodObject<{
            street: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
            state: z.ZodOptional<z.ZodString>;
            postalCode: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
};
export declare const getCustomerSchema: {
    params: z.ZodObject<{
        customerId: z.ZodString;
    }, z.core.$strip>;
};
export declare const updatePasswordSchema: {
    params: z.ZodObject<{
        customerId: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        currentPassword: z.ZodString;
        newPassword: z.ZodString;
        confirmPassword: z.ZodString;
    }, z.core.$strip>;
};
//# sourceMappingURL=Customer-Validation.d.ts.map