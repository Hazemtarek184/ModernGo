import { HydratedDocument, Model } from "mongoose";
import { ICustomer, ICustomerMethods } from "../types/Customer-Interface";
export declare const CustomerModel: Model<import("mongoose").Document<unknown, {}, ICustomer, {}, import("mongoose").DefaultSchemaOptions> & ICustomer & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, {}, {}, {}, import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, ICustomer, {}, import("mongoose").DefaultSchemaOptions> & ICustomer & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, ICustomer, {}, import("mongoose").DefaultSchemaOptions> & ICustomer & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any, import("mongoose").Document<unknown, {}, ICustomer, {}, import("mongoose").DefaultSchemaOptions> & ICustomer & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export type HCustomerDocument = HydratedDocument<ICustomer, ICustomerMethods>;
//# sourceMappingURL=Customer-Module.d.ts.map