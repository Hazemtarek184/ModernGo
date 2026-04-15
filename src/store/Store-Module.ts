import { HydratedDocument, Model, model, models, Schema } from "mongoose";
import { ILocation, IStore, IStoreMethods } from "../types/Store-Interface";
import bcrypt from "bcrypt";

const locationSchema = new Schema<ILocation>(
    {
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
    },
    { _id: false }
);

const storeSchema = new Schema<IStore>(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 255
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false
        },
        address: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        location: { type: locationSchema, required: true },
        categories: [{ type: String, required: true }],
        profilePhoto: { type: String, required: false }
    },
    {
        timestamps: true
    }
);

storeSchema.index({ location: '2dsphere' });

// Hash password before saving
storeSchema.pre('save', async function () {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
storeSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        return false;
    }
};

// Export model with proper typing
export const StoreModel = (models.Store as Model<HydratedDocument<IStore>>) || model<IStore>("Store", storeSchema);

// Export document type with methods
export type HStoreDocument = HydratedDocument<IStore, IStoreMethods>;
