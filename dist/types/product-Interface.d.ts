import { Types } from "mongoose";
export interface IProduct {
    _id?: Types.ObjectId;
    name: string;
    slug: string;
    description: string;
    images: string[];
    mainPrice: number;
    discountPercent: number;
    salePrice: number;
    assistFolderId: string;
    stock: number;
    soldItems: number;
    createdBy: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
    restoredAt?: Date;
    freezedAt?: Date;
    freezedBy?: Types.ObjectId;
    restoredBy?: Types.ObjectId;
}
//# sourceMappingURL=Product-Interface.d.ts.map