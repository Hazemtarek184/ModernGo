import { HydratedDocument, Model, Schema, model, models } from "mongoose";

export interface IPhantomCart {
    phantomKey: string;
    storeProductId: string;
    quantity: number;
}

const phantomCartSchema = new Schema<IPhantomCart>(
    {
        phantomKey: { type: String, required: true },
        storeProductId: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1, min: 0, max: 1 },
    },
    {
        timestamps: true,
    },
);

// One item per phantom person — duplicate upserts update quantity
phantomCartSchema.index({ phantomKey: 1, storeProductId: 1 }, { unique: true });
// Fast lookup when releasing a product globally
phantomCartSchema.index({ storeProductId: 1 });

export const PhantomCartModel =
    (models.PhantomCart as Model<HydratedDocument<IPhantomCart>>) ||
    model<IPhantomCart>("PhantomCart", phantomCartSchema);
