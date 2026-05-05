import { Types } from "mongoose";

export interface IHealthProfile {
    customerId: Types.ObjectId;

    age?: number;
    sex?: string;

    weightKg?: number;
    heightCm?: number;

    pregnant?: boolean;

    allergies?: {
        allergen: string;
        severity?: string;
    }[];

    conditions?: {
        name: string;
        icd10?: string;
        severity?: string;
    }[];

    medications?: {
        name: string;
        doseMg?: number;
        frequencyPerDay?: number;
    }[];

    dietaryRestrictions?: string[];

    riskFactors?: {
        hypertension?: boolean;
        kidneyDisease?: boolean;
        liverDisease?: boolean;
    };

    lastUpdated?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
