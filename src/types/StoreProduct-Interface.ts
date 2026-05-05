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
    ingredients?: string[];

    nutrients?: {
        calories?: number;
        sugar_g?: number;
        sodium_mg?: number;
        fat_g?: number;
    };

    additives?: string[];

    allergens?: string[];

    drugInteractions?: string[];

    warnings?: string[];
}
