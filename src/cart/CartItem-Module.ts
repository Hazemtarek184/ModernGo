import { HydratedDocument, Model, model, models, Schema } from "mongoose";
import { ICartItem } from "../types/CartItem-Interface";

const cartItemSchema = new Schema<ICartItem>(
    {
        customerId: {
            type: Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        storeProductId: {
            type: Schema.Types.ObjectId,
            ref: "StoreProduct",
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity must be at least 1"],
            default: 1,
        },
    },
    {
        timestamps: true,                      // auto createdAt + updatedAt
        toJSON: { virtuals: true },
        toObject: { virtuals: false },
    }
);

// ─── Indexes ─────────────────────────────────────────────────────────

// Prevent duplicate items: one row per customer + storeProduct
cartItemSchema.index({ customerId: 1, storeProductId: 1 }, { unique: true });

// Fast lookup for "get this customer's entire cart"
cartItemSchema.index({ customerId: 1 });

// ─── Virtual: addedAt (alias for createdAt) ──────────────────────────

cartItemSchema.virtual("addedAt").get(function () {
    return (this as any).createdAt;
});

// ─── Export ──────────────────────────────────────────────────────────

export const CartItemModel =
    (models.CartItem as Model<ICartItem>) || model<ICartItem>("CartItem", cartItemSchema);

export type HCartItemDocument = HydratedDocument<ICartItem>;
