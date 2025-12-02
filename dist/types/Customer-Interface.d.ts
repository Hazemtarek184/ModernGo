import { Types } from "mongoose";
export interface IAddress {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}
export interface ICustomer {
    _id?: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    address?: IAddress;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface ICustomerMethods {
    comparePassword(candidatePassword: string): Promise<boolean>;
}
//# sourceMappingURL=Customer-Interface.d.ts.map