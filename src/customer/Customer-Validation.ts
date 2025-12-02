import { z } from 'zod';
import { generalFields } from '../middleware/middleware-Validation';

// Address validation schema
const addressSchema = z.object({
    street: z.string().min(2).max(100).optional(),
    city: z.string().min(2).max(50).optional(),
    state: z.string().min(2).max(50).optional(),
    postalCode: z.string().min(2).max(20).optional(),
    country: z.string().min(2).max(50).optional(),
}).optional();

// Register customer schema
export const registerCustomerSchema = {
    body: z.object({
        firstName: z.string()
            .min(2, { message: "First name must be at least 2 characters" })
            .max(50, { message: "First name must not exceed 50 characters" }),

        lastName: z.string()
            .min(2, { message: "Last name must be at least 2 characters" })
            .max(50, { message: "Last name must not exceed 50 characters" }),

        email: generalFields.email,

        phone: generalFields.phone,

        password: generalFields.password,

        confirmPassword: generalFields.confirmPassword,

        address: addressSchema,
    }).refine(
        data => data.password === data.confirmPassword,
        {
            message: "Passwords don't match",
            path: ["confirmPassword"]
        }
    )
};

// Login customer schema
export const loginCustomerSchema = {
    body: z.object({
        email: generalFields.email,
        password: z.string().min(1, "Password is required"),
    })
};

// Update customer schema (all fields optional except what user wants to update)
export const updateCustomerSchema = {
    params: z.object({
        customerId: generalFields.id,
    }),
    body: z.object({
        firstName: z.string()
            .min(2, { message: "First name must be at least 2 characters" })
            .max(50, { message: "First name must not exceed 50 characters" })
            .optional(),

        lastName: z.string()
            .min(2, { message: "Last name must be at least 2 characters" })
            .max(50, { message: "Last name must not exceed 50 characters" })
            .optional(),

        phone: generalFields.phone.optional(),

        address: addressSchema,
    })
};

// Get customer by ID schema
export const getCustomerSchema = {
    params: z.object({
        customerId: generalFields.id,
    })
};

// Update password schema
export const updatePasswordSchema = {
    params: z.object({
        customerId: generalFields.id,
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
