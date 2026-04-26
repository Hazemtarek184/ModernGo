import { Types } from "mongoose";

export interface IHealthProfile {
    customerId: Types.ObjectId;
    weight?: number;
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
    dietaryRestrictions?: string;
    lastUpdated?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
