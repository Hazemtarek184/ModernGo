import { HydratedDocument, Model, model, models, Schema } from "mongoose";
import { IStoreProduct } from "../types/StoreProduct-Interface";

const storeProductSchema = new Schema<IStoreProduct>(
    {
        storeId: {
            type: Schema.Types.ObjectId,
            ref: "Store",
            required: true,
        },
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: [0, "Price cannot be negative"],
        },
        stock: {
            type: Number,
            required: true,
            min: [0, "Stock cannot be negative"],
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: false },
    }
);

// Compound unique index to prevent duplicate store-product combinations
storeProductSchema.index({ storeId: 1, productId: 1 }, { unique: true });

// Individual indexes for query optimization
storeProductSchema.index({ storeId: 1 });
storeProductSchema.index({ productId: 1 });
storeProductSchema.index({ isAvailable: 1 });

export const StoreProductModel =
    (models.StoreProduct as Model<IStoreProduct>) || model<IStoreProduct>("StoreProduct", storeProductSchema);
export type HStoreProductDocument = HydratedDocument<IStoreProduct>;