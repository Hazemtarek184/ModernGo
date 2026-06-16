import { HydratedDocument, Model, model, models, Schema } from "mongoose";
import { IOrder, IOrderItem } from "../types/Order-Interface";

const orderItemSchema = new Schema<IOrderItem>(
    {
        storeProductId: { type: Schema.Types.ObjectId, ref: "StoreProduct", required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 }
    },
    { _id: false }
);

const orderSchema = new Schema<IOrder>(
    {
        storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
        customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
        items: [orderItemSchema],
        totalAmount: { type: Number, required: true, min: 0 },
        status: { type: String, enum: ['completed', 'cancelled'], default: 'completed' }
    },
    { timestamps: true }
);

orderSchema.index({ storeId: 1, createdAt: -1 });
orderSchema.index({ customerId: 1, createdAt: -1 });

export const OrderModel = (models.Order as Model<HydratedDocument<IOrder>>) || model<IOrder>("Order", orderSchema);
