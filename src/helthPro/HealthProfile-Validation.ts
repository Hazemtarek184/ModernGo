import { z } from "zod";

export const createHealthProfileSchema = {
    body: z.object({
        weight: z.number()
            .positive({ message: "Weight must be a positive number" })
            .optional(),

        allergies: z.array(
            z.string().min(1, { message: "Allergy item cannot be empty" })
        ).optional(),

        medications: z.array(
            z.string().min(1, { message: "Medication item cannot be empty" })
        ).optional(),

        conditions: z.array(
            z.string().min(1, { message: "Condition item cannot be empty" })
        ).optional(),

        dietaryRestrictions: z.string()
            .min(2, { message: "Dietary restrictions must be at least 2 characters" })
            .max(255, { message: "Dietary restrictions must not exceed 255 characters" })
            .optional()
    })
};

export const updateHealthProfileSchema = {
    body: z.object({
        weight: z.number()
            .positive({ message: "Weight must be a positive number" })
            .optional(),

        allergies: z.array(
            z.string().min(1, { message: "Allergy item cannot be empty" })
        ).optional(),

        medications: z.array(
            z.string().min(1, { message: "Medication item cannot be empty" })
        ).optional(),

        conditions: z.array(
            z.string().min(1, { message: "Condition item cannot be empty" })
        ).optional(),

        dietaryRestrictions: z.string()
            .min(2, { message: "Dietary restrictions must be at least 2 characters" })
            .max(255, { message: "Dietary restrictions must not exceed 255 characters" })
            .optional()
    })
};