import { HydratedDocument, model, models, Schema } from "mongoose";
import { IProduct } from "../types/product-Interface";
import slugify from "slugify";




const productSchema = new Schema<IProduct>(
    {


        name: { type: String, required: true, minlength: 2, maxlength: 2000 },
        slug: { type: String, minlength: 2, maxlength: 50 },

        description: { type: String, minlength: 2, maxlength: 5000 },
        assistFolderId: {},

        images: [{ type: String }],
        discountPercent: { type: Number, default: 0 },

        mainPrice: { type: Number, required: true },
        salePrice: { type: Number, required: true },

        soldItems: { type: Number, default: 0 },
        stock: { type: Number, required: true },


        createdBy: { type: Schema.Types.ObjectId, ref: "User" },

        freezedAt: Date,
        freezedBy: { type: Schema.Types.ObjectId, ref: "User" },


        restoreAt: Date,
        restoreBy: { type: Schema.Types.ObjectId, ref: "User" },


    }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: false }
}
);



productSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 })









export const ProductModel = models.product || model<IProduct>("Product", productSchema)
export type HProductDocument = HydratedDocument<IProduct>