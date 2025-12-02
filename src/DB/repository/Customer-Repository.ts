import { HydratedDocument, Model, Types } from "mongoose";
import { DatabaseRepository } from "./Database-Repository";
import { ICustomer } from '../../types/Customer-Interface';

export class CustomerRepository extends DatabaseRepository<ICustomer, HydratedDocument<ICustomer>> {
    constructor(protected override readonly model: Model<HydratedDocument<ICustomer>>) {
        super(model);
    }

    /**
     * Find customer by email
     */
    async findByEmail(email: string): Promise<HydratedDocument<ICustomer> | null> {
        return await this.findOne({
            filter: { email: email.toLowerCase().trim() }
        });
    }

    /**
     * Find customer by email and include password field
     */
    async findByEmailWithPassword(email: string): Promise<HydratedDocument<ICustomer> | null> {
        return await this.model.findOne({ email: email.toLowerCase().trim() }).select('+password').exec();
    }

    /**
     * Find customer by phone
     */
    async findByPhone(phone: string): Promise<HydratedDocument<ICustomer> | null> {
        return await this.findOne({
            filter: { phone: phone.trim() }
        });
    }

    /**
     * Find customer by ID and include password field
     */
    async findByIdWithPassword(id: Types.ObjectId): Promise<HydratedDocument<ICustomer> | null> {
        return await this.model.findById(id).select('+password').exec();
    }
}
