import { Request, Response } from "express";
import { BadRequestException } from "../utils/error.response";
import { successResponse } from "../utils/success.response";
import HealthProfileService from "./HealthProfile-Service";

class HealthProfileController {

    create = async (req: Request, res: Response) => {

        const customerId = req.customer?.customerId;

        if (!customerId) {
            throw new BadRequestException("Missing customerId from token");
        }

        const profile = await HealthProfileService.create(customerId, req.body);

        return successResponse({
            res,
            statuscode: 201,
            data: { profile }
        });
    };

    getMyProfile = async (req: Request, res: Response) => {

        const customerId = req.customer?.customerId;

        if (!customerId) {
            throw new BadRequestException("Missing customerId from token");
        }

        const profile = await HealthProfileService.getMyProfile(customerId);

        return successResponse({
            res,
            statuscode: 200,
            data: { profile }
        });
    };

    update = async (req: Request, res: Response) => {

        const customerId = req.customer?.customerId;

        if (!customerId) {
            throw new BadRequestException("Missing customerId from token");
        }

        const profile = await HealthProfileService.update(customerId, req.body);

        return successResponse({
            res,
            statuscode: 200,
            data: { profile }
        });
    };

    delete = async (req: Request, res: Response) => {

        const customerId = req.customer?.customerId;

        if (!customerId) {
            throw new BadRequestException("Missing customerId from token");
        }

        await HealthProfileService.delete(customerId);

        return successResponse({
            res,
            statuscode: 200,
            data: { message: "Health profile deleted successfully" }
        });
    };
}

export default new HealthProfileController();