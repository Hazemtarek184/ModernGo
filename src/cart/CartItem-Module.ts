import { HydratedDocument, Model, model, models, Schema } from "mongoose";
import { ICartItem } from "../types/CartItem-Interface";

const cartItemSchema = new Schema<ICartItem>(
    {
        customerId: {
            type: Schema.Types.ObjectId,
            ref: "Customer",
            required: true
        },

        storeProductId: {
            type: Schema.Types.ObjectId,
            ref: "StoreProduct",
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: {
            createdAt: "addedAt",
            updatedAt: "updatedAt"
        },
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
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

// Virtual total price
cartItemSchema.virtual("totalPrice").get(function () {
    const storeProduct = this.storeProductId;

    if (!storeProduct || !storeProduct.price) {
        return 0;
    }

    return storeProduct.price * this.quantity;
});

export const CartItemModel =
    (models.CartItem as Model<HydratedDocument<ICartItem>>) ||
    model<ICartItem>("CartItem", cartItemSchema);