import { z } from 'zod';
import type { Response, Request, NextFunction } from "express";
import type { ZodType } from "zod";
type keyReqType = 'body' | 'params' | 'query' | 'file';
type SchemaType = Partial<Record<keyReqType, ZodType>>;
export declare const validation: (schema: SchemaType) => (req: Request, res: Response, next: NextFunction) => void;
export declare const generalFields: {
    username: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    otp: z.ZodString;
    file: (mimetypes: [string, ...string[]]) => z.ZodObject<{
        fieldname: z.ZodString;
        originalname: z.ZodString;
        encoding: z.ZodString;
        mimetype: z.ZodEnum<{
            [x: string]: string;
        }>;
        buffer: z.ZodOptional<z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
        path: z.ZodOptional<z.ZodString>;
        size: z.ZodNumber;
    }, z.core.$strip>;
    id: z.ZodString;
    phone: z.ZodUnion<readonly [z.ZodString, z.ZodString]>;
};
export declare const createPasswordMatchSchema: () => z.ZodObject<{
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, z.core.$strip>;
export declare const signupSchema: {
    body: z.ZodObject<{
        password: z.ZodString;
        confirmPassword: z.ZodString;
        username: z.ZodString;
        email: z.ZodString;
    }, z.core.$strip>;
};
export declare const loginSchema: {
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, z.core.$strip>;
};
export declare const verifyOtpSchema: {
    body: z.ZodObject<{
        email: z.ZodString;
        otp: z.ZodString;
    }, z.core.$strip>;
};
export declare const idParamSchema: {
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
};
export declare const fileValidationExample: z.ZodObject<{
    fieldname: z.ZodString;
    originalname: z.ZodString;
    encoding: z.ZodString;
    mimetype: z.ZodEnum<{
        [x: string]: string;
    }>;
    buffer: z.ZodOptional<z.ZodCustom<Buffer<ArrayBufferLike>, Buffer<ArrayBufferLike>>>;
    path: z.ZodOptional<z.ZodString>;
    size: z.ZodNumber;
}, z.core.$strip>;
export {};
//# sourceMappingURL=middleware-Validation.d.ts.map