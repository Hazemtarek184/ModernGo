import { z } from "zod";
import { generalFields } from "../middleware/middleware-Validation";

const allergySchema = z.object({
    allergen: z.string()
        .min(2, { message: "Allergen must be at least 2 characters" })
        .max(100, { message: "Allergen must not exceed 100 characters" }),

    severity: z.enum(["mild", "moderate", "severe"])
        .optional(),
});

const conditionSchema = z.object({
    name: z.string()
        .min(2, { message: "Condition name must be at least 2 characters" })
        .max(100, { message: "Condition name must not exceed 100 characters" }),

    icd10: z.string()
        .max(20, { message: "ICD10 code must not exceed 20 characters" })
        .optional(),

    severity: z.enum(["mild", "moderate", "severe"])
        .optional(),
});

const medicationSchema = z.object({
    name: z.string()
        .min(2, { message: "Medication name must be at least 2 characters" })
        .max(100, { message: "Medication name must not exceed 100 characters" }),

    doseMg: z.number()
        .positive({ message: "Dose must be greater than 0" })
        .optional(),

    frequencyPerDay: z.number()
        .int({ message: "Frequency must be an integer" })
        .min(1, { message: "Frequency must be at least 1" })
        .max(10, { message: "Frequency must not exceed 10" })
        .optional(),
});

const healthProfileBodySchema = z.object({
    age: z.number()
        .int({ message: "Age must be an integer" })
        .min(0, { message: "Age must be at least 0" })
        .max(120, { message: "Age must not exceed 120" })
        .optional(),

    sex: z.enum(["male", "female"])
        .optional(),

    weightKg: z.number()
        .positive({ message: "Weight must be greater than 0" })
        .max(500, { message: "Weight must not exceed 500 kg" })
        .optional(),

    heightCm: z.number()
        .positive({ message: "Height must be greater than 0" })
        .max(250, { message: "Height must not exceed 250 cm" })
        .optional(),

    pregnant: z.boolean().optional(),

    allergies: z.array(allergySchema).optional(),

    conditions: z.array(conditionSchema).optional(),

    medications: z.array(medicationSchema).optional(),

    dietaryRestrictions: z.array(
        z.string()
            .min(2, { message: "Dietary restriction must be at least 2 characters" })
            .max(100, { message: "Dietary restriction must not exceed 100 characters" }),
    ).optional(),

    riskFactors: z.object({
        hypertension: z.boolean().optional(),
        kidneyDisease: z.boolean().optional(),
        liverDisease: z.boolean().optional(),
    }).optional(),
});

export const createHealthProfileSchema = {
    body: healthProfileBodySchema,
};

export const updateHealthProfileSchema = {
    body: healthProfileBodySchema.partial(),
};

export const getHealthProfileSchema = {
    params: z.object({
        customerId: generalFields.id,
    }),
};

export const deleteHealthProfileSchema = {
    params: z.object({
        customerId: generalFields.id,
    }),
};