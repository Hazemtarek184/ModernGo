import { Types } from "mongoose";
export interface IStoreProduct {
    _id?: Types.ObjectId;
    storeId: Types.ObjectId;
    productId: Types.ObjectId;
    price: number;
    stock: number;
    isAvailable: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
//# sourceMappingURL=StoreProduct-Interface.d.ts.map