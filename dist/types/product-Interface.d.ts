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
    updateAt?: Date;
    restoreAt?: Date;
    freezedAt?: Date | undefined;
    freezedBy?: Types.ObjectId;
    restoredAt?: Date | undefined;
    restoreBy?: Types.ObjectId;
}
//# sourceMappingURL=product-Interface.d.ts.map