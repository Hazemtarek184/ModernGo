import { z } from 'zod';
import type { Response, Request, NextFunction } from "express";
import type { ZodType } from "zod";
type keyReqType = keyof Request;
type SchemaType = Partial<Record<keyReqType, ZodType>>;
export declare const validation: (schema: SchemaType) => (req: Request, res: Response, next: NextFunction) => NextFunction;
export declare const generalFields: {
    username: z.ZodString;
    email: z.ZodEmail;
    password: z.ZodString;
    confirmPassword: z.ZodString;
    otp: z.ZodString;
    file: (mimetype: string[]) => z.ZodObject<{
        fieldname: z.ZodString;
        originalname: z.ZodString;
        encoding: z.ZodString;
        mimetype: z.ZodEnum<{
            [x: string]: string;
        }>;
        buffer: z.ZodOptional<z.ZodAny>;
        path: z.ZodOptional<z.ZodAny>;
        size: z.ZodNumber;
    }, z.core.$strict>;
    id: z.ZodString;
};
export {};
//# sourceMappingURL=middleware.validation.d.ts.map