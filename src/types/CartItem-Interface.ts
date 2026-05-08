import { Types } from "mongoose";

export interface ICartItem {
    customerId: Types.ObjectId;
    storeProductId: Types.ObjectId | any;
    quantity: number;
    isActive: boolean;
    totalPrice?: number;
    addedAt?: Date;
    updatedAt?: Date;
}