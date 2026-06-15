import { HydratedDocument, Model, Types } from "mongoose";
import { DatabaseRepository } from "./Database-Repository";
import { IStore } from '../../types/Store-Interface';

export class StoreRepository extends DatabaseRepository<IStore, HydratedDocument<IStore>> {
    constructor(protected override readonly model: Model<IStore>) {
        super(model);
    }

    /**
     * Find store by email
     */
    async findByEmail(email: string): Promise<HydratedDocument<IStore> | null> {
        return await this.findOne({
            filter: { email: email.toLowerCase().trim() }
        });
    }

    /**
     * Find store by email and include password field
     */
    async findByEmailWithPassword(email: string): Promise<HydratedDocument<IStore> | null> {
        return await this.model.findOne({ email: email.toLowerCase().trim() }).select('+password').exec();
    }

    /**
     * Find store by phone
     */
    async findByPhone(phone: string): Promise<HydratedDocument<IStore> | null> {
        return await this.findOne({
            filter: { phone: phone.trim() }
        });
    }

    /**
     * Find store by ID and include password field
     */
    async findByIdWithPassword(id: Types.ObjectId): Promise<HydratedDocument<IStore> | null> {
        return await this.model.findById(id).select('+password').exec();
    }
}
