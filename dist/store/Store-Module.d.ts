import mongoose from "mongoose";
import { Store } from "../types/Store-Interface";
export declare const storeModel: mongoose.Model<Store, {}, {}, {}, mongoose.Document<unknown, {}, Store, {}, mongoose.DefaultSchemaOptions> & Store & Required<{
    _id: mongoose.mongo.BSON.ObjectId;
}> & {
    __v: number;
}, any, Store>;
//# sourceMappingURL=Store-Module.d.ts.map