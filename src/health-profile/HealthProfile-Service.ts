import { HydratedDocument, Model, Types } from "mongoose";
import { BadRequestException, NotFoundException } from "../utils/error.response";
import { HealthProfileRepository } from "../DB/repository/HealthProfile-Repository";
import { IHealthProfile } from "../types/HealthProfile-Interface";
import { HealthProfileModel } from "../health-profile/HealthProfile-Modul";
class HealthProfileService {
    private healthProfileRepository = new HealthProfileRepository(
        HealthProfileModel as Model<HydratedDocument<IHealthProfile>>);

    private validateCustomerId(customerId: string) {
        if (!Types.ObjectId.isValid(customerId)) {
            throw new BadRequestException("Invalid customerId format");
        }
    }

    async create(customerId: string, data: Partial<IHealthProfile>) {
        this.validateCustomerId(customerId);

        const existing = await this.healthProfileRepository.findByCustomerId(customerId);

        if (existing) {
            throw new BadRequestException("Health profile already exists");
        }

        const [profile] = await this.healthProfileRepository.create({
            data: [
                {
                    customerId: new Types.ObjectId(customerId),
                    ...data,
                    lastUpdated: new Date(),
                },
            ],
        });

        return profile;
    }

    async getMyProfile(customerId: string) {
        this.validateCustomerId(customerId);

        const profile = await this.healthProfileRepository.findByCustomerId(customerId);

        if (!profile) {
            throw new NotFoundException("Health profile not found");
        }

        return profile;
    }

    async update(customerId: string, data: Partial<IHealthProfile>) {
        this.validateCustomerId(customerId);

        const profile = await this.healthProfileRepository.updateByCustomerId(
            customerId,
            {
                ...data,
                lastUpdated: new Date(),
            },
        );

        if (!profile) {
            throw new NotFoundException("Health profile not found");
        }

        return profile;
    }

    async delete(customerId: string) {
        this.validateCustomerId(customerId);

        const profile = await this.healthProfileRepository.deleteByCustomerId(customerId);

        if (!profile) {
            throw new NotFoundException("Health profile not found");
        }

        return profile;
    }
}

export default new HealthProfileService();