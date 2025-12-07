import { HydratedDocument, Model, model, models, Schema } from "mongoose";
import { IAddress, ICustomer, ICustomerMethods } from "../types/Customer-Interface";
import bcrypt from "bcrypt";

const addressSchema = new Schema<IAddress>(
    {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        postalCode: { type: String },
        country: { type: String },
    },
    { _id: false }
);

const customerSchema = new Schema<ICustomer>(
    {
        firstName: { type: String, required: true, minlength: 2, maxlength: 50 },
        lastName: { type: String, required: true, minlength: 2, maxlength: 50 },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 255
        },

        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            minlength: 8,
            maxlength: 128,
            select: false
        },

        profilePhoto: {
            type: String,
            required: false
        },

        address: { type: addressSchema },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: false }
    }
);

// Virtual for full name
customerSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
customerSchema.pre('save', async function () {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
customerSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        return false;
    }
};

// Export model with proper typing
export const CustomerModel = (models.Customer as Model<HydratedDocument<ICustomer>>) || model<ICustomer>("Customer", customerSchema);

// Export document type with methods
export type HCustomerDocument = HydratedDocument<ICustomer, ICustomerMethods>;
