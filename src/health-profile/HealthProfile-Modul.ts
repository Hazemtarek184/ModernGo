import { HydratedDocument, Model, model, models, Schema } from "mongoose";
import { IHealthProfile } from "../types/HealthProfile-Interface";

const healthProfileSchema = new Schema<IHealthProfile>(
    {
        customerId: {
            type: Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
            unique: true,
        },

        age: Number,
        sex: String,

        weightKg: Number,
        heightCm: Number,

        pregnant: Boolean,

        allergies: [
            {
                allergen: String,
                severity: String,
            },
        ],

        conditions: [
            {
                name: String,
                icd10: String,
                severity: String,
            },
        ],

        medications: [
            {
                name: String,
                doseMg: Number,
                frequencyPerDay: Number,
            },
        ],

        dietaryRestrictions: {
            type: [String],
            default: [],
        },

        riskFactors: {
            hypertension: Boolean,
            kidneyDisease: Boolean,
            liverDisease: Boolean,
        },

        lastUpdated: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    },
);

export const HealthProfileModel: Model<HydratedDocument<IHealthProfile>> =
    (models.HealthProfile as Model<HydratedDocument<IHealthProfile>>) ||
    model<IHealthProfile>("HealthProfile", healthProfileSchema);