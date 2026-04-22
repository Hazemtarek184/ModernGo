import { HydratedDocument, Model, Types } from "mongoose";
import { DatabaseRepository, Lean } from "./Database-Repository";
import { IHealthProfile } from "../../types/HealthProfile-Interface";

type HealthProfileDoc = HydratedDocument<IHealthProfile>;
type HealthProfileResult = HealthProfileDoc | Lean<HealthProfileDoc> | null;

export class HealthProfileRepository extends DatabaseRepository<IHealthProfile, HealthProfileDoc> {
    constructor(protected override model: Model<HealthProfileDoc>) {
        super(model);
    }

    async findByCustomerId(customerId: Types.ObjectId | string): Promise<HealthProfileDoc | null> {
        const normalizedCustomerId =
            typeof customerId === "string" ? new Types.ObjectId(customerId) : customerId;

        return await this.findOne({
            filter: { customerId: normalizedCustomerId }
        }) as HealthProfileDoc | null;
    }

    async updateByCustomerId(
        customerId: Types.ObjectId | string,
        update: Partial<IHealthProfile>
    ): Promise<HealthProfileResult> {
        const normalizedCustomerId =
            typeof customerId === "string" ? new Types.ObjectId(customerId) : customerId;

        return await this.findOneAndUpdate({
            filter: { customerId: normalizedCustomerId },
            update,
            options: { new: true }
        });
    }

    async deleteByCustomerId(customerId: Types.ObjectId | string): Promise<HealthProfileResult> {
        const normalizedCustomerId =
            typeof customerId === "string" ? new Types.ObjectId(customerId) : customerId;

        return await this.findOneAndDelete({
            filter: { customerId: normalizedCustomerId }
        });
    }
}