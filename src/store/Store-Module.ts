import mongoose, { Schema } from "mongoose";
import { Store } from "./Store-Interface";

const locationSchema: Schema = new Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
    },
    coordinates: {
        type: [Number],
        required: true,
        validate: {
            validator: function (v: number[]) {
                return v.length === 2;
            },
            message: 'Coordinates must contain exactly 2 numbers [longitude, latitude]'
        }
    },
    address: { type: String, required: false }
}, { _id: false });

const storeSchema: Schema = new Schema({
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    location: { type: locationSchema, required: true },
    categories: [{ type: String, required: true }]
}, {
    timestamps: true
});

storeSchema.index({ location: '2dsphere' });

export const storeModel = mongoose.model<Store>("Store", storeSchema);