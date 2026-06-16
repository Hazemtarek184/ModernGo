import { Types } from "mongoose";

export interface IOrderItem {
    storeProductId: Types.ObjectId;
    quantity: number;
    price: number;
}

export interface IOrder {
    storeId: Types.ObjectId;
    customerId?: Types.ObjectId;
    items: IOrderItem[];
    totalAmount: number;
    status: 'completed' | 'cancelled';
    createdAt?: Date;
    updatedAt?: Date;
}
