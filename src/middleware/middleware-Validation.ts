import { z } from 'zod';
import type { Response, Request, NextFunction } from "express";
import type { ZodError, ZodType } from "zod";
import { Types } from "mongoose";
import { BadRequestException } from '../utils/error.response';


type keyReqType = 'body' | 'params' | 'query' | 'file';
type SchemaType = Partial<Record<keyReqType, ZodType>>;
type validationErrorsType = Array<{
    key: keyReqType;
    issues: Array<{
        message: string;
        path: (string | number | symbol | undefined)[];
    }>;
}>;

export const validation = (schema: SchemaType) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const validationErrors: validationErrorsType = [];

        for (const key of Object.keys(schema) as keyReqType[]) {
            if (!schema[key]) continue;

            const validationResult = schema[key].safeParse(req[key]);

            if (!validationResult.success) {
                const errors = validationResult.error as ZodError;

                validationErrors.push({
                    key,
                    issues: errors.issues.map((issue) => {
                        return { message: issue.message, path: issue.path }
                    }),
                });
            }
        }

        if (validationErrors.length) {
            throw new BadRequestException("Validation Error", {
                validationErrors,
            });
        }

        next();
    };
};

// Constants for validation
const USERNAME_MIN_LENGTH = 2;
const USERNAME_MAX_LENGTH = 20;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const EMAIL_MAX_LENGTH = 255;
const OTP_LENGTH = 6;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const generalFields = {
    username: z.string()
        .min(USERNAME_MIN_LENGTH, `Username must be at least ${USERNAME_MIN_LENGTH} characters`)
        .max(USERNAME_MAX_LENGTH, `Username must not exceed ${USERNAME_MAX_LENGTH} characters`)
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),

    email: z.string()
        .email("Invalid email format")
        .max(EMAIL_MAX_LENGTH, "Email too long")
        .toLowerCase()
        .trim(),

    password: z.string()
        .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
        .max(PASSWORD_MAX_LENGTH, "Password too long")
        .regex(
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
            "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number"
        ),

    confirmPassword: z.string(),

    otp: z.string()
        .length(OTP_LENGTH, `OTP must be exactly ${OTP_LENGTH} digits`)
        .regex(/^\d+$/, "OTP must contain only numbers"),

    file: (mimetypes: [string, ...string[]]) => {
        return z.object({
            fieldname: z.string(),
            originalname: z.string(),
            encoding: z.string(),
            mimetype: z.enum(mimetypes, {
                message: `File type must be one of: ${mimetypes.join(', ')}`
            }),
            buffer: z.instanceof(Buffer).optional(),
            path: z.string().optional(),
            size: z.number()
                .positive("File size must be greater than 0")
                .max(MAX_FILE_SIZE, `File size must not exceed ${MAX_FILE_SIZE / 1024 / 1024}MB`),
        }).refine(
            data => data.buffer || data.path,
            {
                message: "Either buffer or path must be provided",
                path: ["file"]
            }
        );
    },

    id: z.string().refine(
        (data) => Types.ObjectId.isValid(data),
        { message: "Invalid MongoDB ObjectId format" }
    ),

    // Phone number validation (Egyptian format only)
    // Supports: 01012345678 (local) or +201012345678 (international)
    phone: z.union([
        z.string().regex(/^0(10|11|12|15)\d{8}$/, "Phone must be 11 digits starting with 010, 011, 012, or 015"),
        z.string().regex(/^\+20(10|11|12|15)\d{8}$/, "Phone must be in format +20 followed by 10 digits (010, 011, 012, or 015)")
    ])
};

// Helper to create password match validation for registration schemas
export const createPasswordMatchSchema = () => {
    return z.object({
        password: generalFields.password,
        confirmPassword: generalFields.confirmPassword
    }).refine(
        data => data.password === data.confirmPassword,
        {
            message: "Passwords don't match",
            path: ["confirmPassword"]
        }
    );
};

// Example usage schemas - using merge instead of extend for schemas with refinements
export const signupSchema = {
    body: createPasswordMatchSchema().merge(z.object({
        username: generalFields.username,
        email: generalFields.email,
    }))
};

export const loginSchema = {
    body: z.object({
        email: generalFields.email,
        password: z.string().min(1, "Password is required"),
    })
};

export const verifyOtpSchema = {
    body: z.object({
        email: generalFields.email,
        otp: generalFields.otp,
    })
};

export const idParamSchema = {
    params: z.object({
        id: generalFields.id,
    })
};

/**
 * NOTE: File validation schema
 * 
 * Express-multer places uploaded files in req.file or req.files, 
 * NOT in req.body. This schema is provided as a reference but 
 * should be validated differently:
 * 
 * Option 1: Validate after multer middleware
 *   router.post('/upload', upload.single('image'), (req, res, next) => {
 *       const result = generalFields.file(['image/jpeg', 'image/png']).safeParse(req.file);
 *       if (!result.success) return next(new BadRequestException(...));
 *       next();
 *   });
 * 
 * Option 2: Create custom file validation middleware
 *   export const validateFile = (mimetypes) => (req, res, next) => { ... }
 */
export const fileValidationExample = generalFields.file(['image/jpeg', 'image/png', 'image/webp', 'image/jpg']);