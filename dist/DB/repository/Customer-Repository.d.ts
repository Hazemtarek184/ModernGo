import { HydratedDocument, Model, Types } from "mongoose";
import { DatabaseRepository } from "./Database-Repository";
import { ICustomer } from '../../types/Customer-Interface';
export declare class CustomerRepository extends DatabaseRepository<ICustomer, HydratedDocument<ICustomer>> {
    protected readonly model: Model<HydratedDocument<ICustomer>>;
    constructor(model: Model<HydratedDocument<ICustomer>>);
    findByEmail(email: string): Promise<HydratedDocument<ICustomer> | null>;
    findByEmailWithPassword(email: string): Promise<HydratedDocument<ICustomer> | null>;
    findByPhone(phone: string): Promise<HydratedDocument<ICustomer> | null>;
    findByIdWithPassword(id: Types.ObjectId): Promise<HydratedDocument<ICustomer> | null>;
}
//# sourceMappingURL=Customer-Repository.d.ts.map