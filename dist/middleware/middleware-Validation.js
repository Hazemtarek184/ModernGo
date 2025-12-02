"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileValidationExample = exports.idParamSchema = exports.verifyOtpSchema = exports.loginSchema = exports.signupSchema = exports.createPasswordMatchSchema = exports.generalFields = exports.validation = void 0;
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
const error_response_1 = require("../utils/error.response");
const validation = (schema) => {
    return (req, res, next) => {
        const validationErrors = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            const validationResult = schema[key].safeParse(req[key]);
            if (!validationResult.success) {
                const errors = validationResult.error;
                validationErrors.push({
                    key,
                    issues: errors.issues.map((issue) => {
                        return { message: issue.message, path: issue.path };
                    }),
                });
            }
        }
        if (validationErrors.length) {
            throw new error_response_1.BadRequestException("Validation Error", {
                validationErrors,
            });
        }
        next();
    };
};
exports.validation = validation;
const USERNAME_MIN_LENGTH = 2;
const USERNAME_MAX_LENGTH = 20;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const EMAIL_MAX_LENGTH = 255;
const OTP_LENGTH = 6;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
exports.generalFields = {
    username: zod_1.z.string()
        .min(USERNAME_MIN_LENGTH, `Username must be at least ${USERNAME_MIN_LENGTH} characters`)
        .max(USERNAME_MAX_LENGTH, `Username must not exceed ${USERNAME_MAX_LENGTH} characters`)
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: zod_1.z.string()
        .email("Invalid email format")
        .max(EMAIL_MAX_LENGTH, "Email too long")
        .toLowerCase()
        .trim(),
    password: zod_1.z.string()
        .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
        .max(PASSWORD_MAX_LENGTH, "Password too long")
        .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/, "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number"),
    confirmPassword: zod_1.z.string(),
    otp: zod_1.z.string()
        .length(OTP_LENGTH, `OTP must be exactly ${OTP_LENGTH} digits`)
        .regex(/^\d+$/, "OTP must contain only numbers"),
    file: (mimetypes) => {
        return zod_1.z.object({
            fieldname: zod_1.z.string(),
            originalname: zod_1.z.string(),
            encoding: zod_1.z.string(),
            mimetype: zod_1.z.enum(mimetypes, {
                message: `File type must be one of: ${mimetypes.join(', ')}`
            }),
            buffer: zod_1.z.instanceof(Buffer).optional(),
            path: zod_1.z.string().optional(),
            size: zod_1.z.number()
                .positive("File size must be greater than 0")
                .max(MAX_FILE_SIZE, `File size must not exceed ${MAX_FILE_SIZE / 1024 / 1024}MB`),
        }).refine(data => data.buffer || data.path, {
            message: "Either buffer or path must be provided",
            path: ["file"]
        });
    },
    id: zod_1.z.string().refine((data) => mongoose_1.Types.ObjectId.isValid(data), { message: "Invalid MongoDB ObjectId format" }),
    phone: zod_1.z.union([
        zod_1.z.string().regex(/^0(10|11|12|15)\d{8}$/, "Phone must be 11 digits starting with 010, 011, 012, or 015"),
        zod_1.z.string().regex(/^\+20(10|11|12|15)\d{8}$/, "Phone must be in format +20 followed by 10 digits (010, 011, 012, or 015)")
    ])
};
const createPasswordMatchSchema = () => {
    return zod_1.z.object({
        password: exports.generalFields.password,
        confirmPassword: exports.generalFields.confirmPassword
    }).refine(data => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"]
    });
};
exports.createPasswordMatchSchema = createPasswordMatchSchema;
exports.signupSchema = {
    body: (0, exports.createPasswordMatchSchema)().merge(zod_1.z.object({
        username: exports.generalFields.username,
        email: exports.generalFields.email,
    }))
};
exports.loginSchema = {
    body: zod_1.z.object({
        email: exports.generalFields.email,
        password: zod_1.z.string().min(1, "Password is required"),
    })
};
exports.verifyOtpSchema = {
    body: zod_1.z.object({
        email: exports.generalFields.email,
        otp: exports.generalFields.otp,
    })
};
exports.idParamSchema = {
    params: zod_1.z.object({
        id: exports.generalFields.id,
    })
};
exports.fileValidationExample = exports.generalFields.file(['image/jpeg', 'image/png', 'image/webp', 'image/jpg']);
//# sourceMappingURL=middleware-Validation.js.map