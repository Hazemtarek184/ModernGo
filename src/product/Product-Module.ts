import { HydratedDocument, Model, model, models, Schema } from "mongoose";
import { IProduct } from "../types/Product-Interface";

const productSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true, minlength: 2, maxlength: 2000 },
        slug: { type: String, minlength: 2, maxlength: 50, required: true },

        description: { type: String, minlength: 2, maxlength: 5000, required: true },
        assistFolderId: { type: String, required: true },

        images: [{ type: String }],
        discountPercent: { type: Number, default: 0, min: 0, max: 100 },

        mainPrice: { type: Number, required: true, min: 0 },
        salePrice: { type: Number, required: true, min: 0 },

        soldItems: { type: Number, default: 0 },
        stock: { type: Number, required: true },

        createdBy: { type: Schema.Types.ObjectId, ref: "Store" },
        updatedBy: { type: Schema.Types.ObjectId, ref: "Store" },

        freezedAt: Date,
        freezedBy: { type: Schema.Types.ObjectId, ref: "Store" },

        restoredAt: Date,
        restoredBy: { type: Schema.Types.ObjectId, ref: "Store" },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: false }
    }
);

export const ProductModel = (models.Product as Model<HydratedDocument<IProduct>>) || model<IProduct>("Product", productSchema);
export type HProductDocument = HydratedDocument<IProduct>;