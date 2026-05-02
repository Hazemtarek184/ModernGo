import { z } from "zod";

const allergySchema = z.object({
    allergen: z.string(),
    severity: z.string().optional()
});

const conditionSchema = z.object({
    name: z.string(),
    icd10: z.string().optional(),
    severity: z.string().optional()
});

const medicationSchema = z.object({
    name: z.string(),
    doseMg: z.number().optional(),
    frequencyPerDay: z.number().optional()
});

export const createHealthProfileSchema = {
    body: z.object({
        age: z.number().optional(),
        sex: z.string().optional(),

        weightKg: z.number().optional(),
        heightCm: z.number().optional(),

        pregnant: z.boolean().optional(),

        allergies: z.array(allergySchema).optional(),
        conditions: z.array(conditionSchema).optional(),
        medications: z.array(medicationSchema).optional(),

        dietaryRestrictions: z.array(z.string()).optional(),

        riskFactors: z.object({
            hypertension: z.boolean().optional(),
            kidneyDisease: z.boolean().optional(),
            liverDisease: z.boolean().optional()
        }).optional()
    })
};

export const updateHealthProfileSchema = createHealthProfileSchema;