import { z } from 'zod';
import { generalFields } from '../middleware/middleware-Validation';

// Location validation schema
const locationSchema = z.object({
    type: z.literal('Point').default('Point'),
    coordinates: z.tuple([
        z.number().min(-180).max(180),
        z.number().min(-90).max(90)
    ]),
    address: z.string().optional(),
});

// Register store schema
export const registerStoreSchema = {
    body: z.object({
        name: z.string()
            .min(2, { message: "Store name must be at least 2 characters" })
            .max(100, { message: "Store name must not exceed 100 characters" }),

        email: generalFields.email,

        password: generalFields.password,

        confirmPassword: generalFields.confirmPassword,

        address: z.string()
            .min(5, { message: "Address must be at least 5 characters" })
            .max(200, { message: "Address must not exceed 200 characters" }),

        phone: generalFields.phone,

        location: locationSchema,

        categories: z.array(z.string().min(1)).min(1, { message: "At least one category is required" }),
    }).refine(
        data => data.password === data.confirmPassword,
        {
            message: "Passwords don't match",
            path: ["confirmPassword"]
        }
    ),
    file: z.object({
        fieldname: z.literal('profilePhoto'),
        mimetype: z.enum(['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']),
    }).optional()
};

// Login store schema
export const loginStoreSchema = {
    body: z.object({
        email: generalFields.email,
        password: z.string().min(1, "Password is required"),
    })
};

// Update store schema
export const updateStoreSchema = {
    params: z.object({
        storeId: generalFields.id,
    }),
    body: z.object({
        name: z.string()
            .min(2, { message: "Store name must be at least 2 characters" })
            .max(100, { message: "Store name must not exceed 100 characters" })
            .optional(),

        address: z.string()
            .min(5, { message: "Address must be at least 5 characters" })
            .max(200, { message: "Address must not exceed 200 characters" })
            .optional(),

        phone: generalFields.phone.optional(),

        location: locationSchema.optional(),

        categories: z.array(z.string().min(1)).min(1).optional(),
    })
};

// Get store by ID schema
export const getStoreSchema = {
    params: z.object({
        storeId: generalFields.id,
    })
};

// Update password schema
export const updatePasswordSchema = {
    params: z.object({
        storeId: generalFields.id,
    }),
    body: z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: generalFields.password,
        confirmPassword: generalFields.confirmPassword,
    }).refine(
        data => data.newPassword === data.confirmPassword,
        {
            message: "Passwords don't match",
            path: ["confirmPassword"]
        }
    )
};

// Search store schema
export const searchStoreSchema = {
    query: z.object({
        query: z.string().min(1, "Search query is required").trim(),
    })
};

// Nearby store schema
export const nearbyStoreSchema = {
    query: z.object({
        longitude: z.coerce.number().min(-180).max(180),
        latitude: z.coerce.number().min(-90).max(90),
        maxDistance: z.coerce.number().min(100).max(50000).default(5000).optional(),
    })
};

// Category store schema
export const categoryStoreSchema = {
    params: z.object({
        category: z.string().min(1, "Category is required").trim(),
    })
};
