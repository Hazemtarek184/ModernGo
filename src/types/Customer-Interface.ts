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

// Interface for Customer document instance methods
export interface ICustomerMethods {
    comparePassword(candidatePassword: string): Promise<boolean>;
}
