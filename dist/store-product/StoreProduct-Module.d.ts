import { HydratedDocument, Model } from "mongoose";
import { IStoreProduct } from "../types/StoreProduct-Interface";
export declare const StoreProductModel: Model<IStoreProduct, {}, {}, {}, import("mongoose").Document<unknown, {}, IStoreProduct, {}, import("mongoose").DefaultSchemaOptions> & IStoreProduct & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any, IStoreProduct>;
export type HStoreProductDocument = HydratedDocument<IStoreProduct>;
//# sourceMappingURL=StoreProduct-Module.d.ts.map