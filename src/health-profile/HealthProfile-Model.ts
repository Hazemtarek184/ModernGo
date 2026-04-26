import { model, models, Schema } from "mongoose";
import { IHealthProfile } from "../types/HealthProfile-Interface";

const healthProfileSchema = new Schema<IHealthProfile>(
    {
        customerId: {
            type: Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
            unique: true
        },

        weight: {
            type: Number
        },

        allergies: {
            type: [String],
            default: []
        },

        medications: {
            type: [String],
            default: []
        },

        conditions: {
            type: [String],
            default: []
        },

        dietaryRestrictions: {
            type: String,
            trim: true
        },

        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

export const HealthProfileModel =
    models.HealthProfile || model<IHealthProfile>("HealthProfile", healthProfileSchema);
