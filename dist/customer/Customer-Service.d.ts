import { Types } from "mongoose";
interface RegisterCustomerDto {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    address?: {
        street?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    } | undefined;
}
interface LoginCustomerDto {
    email: string;
    password: string;
}
interface UpdateCustomerDto {
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    address?: {
        street?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
        country?: string | undefined;
    } | undefined;
}
interface UpdatePasswordDto {
    currentPassword: string;
    newPassword: string;
}
declare class CustomerService {
    private customerRepository;
    constructor();
    registerCustomer(dto: RegisterCustomerDto): Promise<{
        customer: {
            _id: Types.ObjectId;
            firstName: string;
            lastName: string;
            email: string;
            phone: string;
            profilePhoto?: string;
            address?: import("../types/Customer-Interface").IAddress;
            createdAt?: Date;
            updatedAt?: Date;
            __v: number;
        };
        token: string;
    }>;
    loginCustomer(dto: LoginCustomerDto): Promise<{
        customer: {
            _id: Types.ObjectId;
            firstName: string;
            lastName: string;
            email: string;
            phone: string;
            profilePhoto?: string;
            address?: import("../types/Customer-Interface").IAddress;
            createdAt?: Date;
            updatedAt?: Date;
            __v: number;
        };
        token: string;
    }>;
    getCustomerProfile(customerId: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../types/Customer-Interface").ICustomer, {}, import("mongoose").DefaultSchemaOptions> & import("../types/Customer-Interface").ICustomer & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, import("../types/Customer-Interface").ICustomer, {}, import("mongoose").DefaultSchemaOptions> & import("../types/Customer-Interface").ICustomer & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateCustomerProfile(customerId: string, dto: UpdateCustomerDto): Promise<(import("mongoose").Document<unknown, {}, import("../types/Customer-Interface").ICustomer, {}, import("mongoose").DefaultSchemaOptions> & import("../types/Customer-Interface").ICustomer & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("../types/Customer-Interface").ICustomer, {}, import("mongoose").DefaultSchemaOptions> & import("../types/Customer-Interface").ICustomer & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>>;
    updatePassword(customerId: string, dto: UpdatePasswordDto): Promise<{
        message: string;
    }>;
}
declare const _default: CustomerService;
export default _default;
//# sourceMappingURL=Customer-Service.d.ts.map