import { BadRequestException } from "../utils/error.response";
import { HealthProfileModel } from "./HealthProfile-Model";
import { HealthProfileRepository } from "../DB/repository/HealthProfile-Repository";
import { HydratedDocument, Model, Types } from "mongoose";
import { IHealthProfile } from "../types/HealthProfile-Interface";

class HealthProfileService {
    private healthProfileRepository = new HealthProfileRepository(
        HealthProfileModel as Model<HydratedDocument<IHealthProfile>>
    );
    async create(customerId: string, data: any) {

        const existing = await this.healthProfileRepository.findByCustomerId(customerId);

        if (existing) {
            throw new BadRequestException("Health profile already exists");
        }

        const [profile] = await this.healthProfileRepository.create({
            data: [{
                customerId: new Types.ObjectId(customerId),
                ...data,
                lastUpdated: new Date()
            }]
        });

        return profile;
    }

    async getMyProfile(customerId: string) {

        const profile = await this.healthProfileRepository.findByCustomerId(customerId);

        if (!profile) {
            throw new BadRequestException("Health profile not found");
        }

        return profile;
    }

    async update(customerId: string, data: any) {

        const profile = await this.healthProfileRepository.updateByCustomerId(
            customerId,
            {
                ...data,
                lastUpdated: new Date()
            }
        );

        if (!profile) {
            throw new BadRequestException("Health profile not found");
        }

        return profile;
    }

    async delete(customerId: string) {

        const profile = await this.healthProfileRepository.deleteByCustomerId(customerId);

        if (!profile) {
            throw new BadRequestException("Health profile not found");
        }

        return;
    }
}

export default new HealthProfileService();