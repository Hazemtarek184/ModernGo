import type { Request, Response } from "express";
import { Types } from "mongoose";
import { BadRequestException, ForbiddenException } from "../utils/error.response";
import { successResponse } from "../utils/success.response";
import CustomerService from "./Customer-Service";
import { getFile, uploadFile } from "../utils/s3.config";

class CustomerController {
    constructor() { }

    /**
     * POST /api/customers/register
     * Register without photo
     */
    registerCustomer = async (req: Request, res: Response): Promise<Response> => {

        const customerId = new Types.ObjectId();

        const { confirmPassword, ...registerDto } = req.body;

        const { customer, token } = await CustomerService.registerCustomer({
            ...registerDto,
            _id: customerId,
            profilePhotoKey: ""
        });

        return successResponse({
            res,
            statuscode: 201,
            data: {
                customer,
                token
            }
        });
    };

    /**
     * GET profile photo (proxy)
     */
    getMyProfilePhoto = async (req: Request, res: Response): Promise<void> => {
        const customerId = req.customer?.customerId;

        if (!customerId) {
            throw new BadRequestException("Missing customerId from token");
        }

        const key = await CustomerService.getProfilePhotoKey(customerId);
        const file = await getFile({ Key: key });

        if (!file.Body) {
            throw new BadRequestException("Failed to load profile photo");
        }

        if (file.ContentType) {
            res.setHeader("Content-Type", file.ContentType);
        }

        if (file.ContentLength) {
            res.setHeader("Content-Length", file.ContentLength.toString());
        }

        res.setHeader("Cache-Control", "public, max-age=86400");
        (file.Body as NodeJS.ReadableStream).pipe(res);
    };

    /**
     * Upload profile photo
     */
    uploadProfilePhoto = async (req: Request, res: Response): Promise<Response> => {
        const customerId = req.customer?.customerId;

        if (!customerId)
            throw new BadRequestException("Missing customerId from token");

        if (!req.file)
            throw new BadRequestException("photo is required");

        const key = await uploadFile({
            file: req.file as Express.Multer.File,
            path: `customer/${customerId}/profile`
        });

        await CustomerService.updateProfilePhotoKey(customerId, key);

        return successResponse({
            res,
            statuscode: 200,
            data: {
                message: "Photo uploaded successfully",
                key
            }
        });
    };

    /**
     * POST /login
     */
    loginCustomer = async (req: Request, res: Response): Promise<Response> => {
        const customer = await CustomerService.loginCustomer(req.body);

        return successResponse({
            res,
            statuscode: 200,
            data: { customer }
        });
    };

    /**
     * GET profile
     */
    getCustomerProfile = async (req: Request, res: Response): Promise<Response> => {
        const { customerId } = req.params;

        if (req.customer!.customerId !== customerId) {
            throw new ForbiddenException("You can only view your own profile");
        }

        const customer = await CustomerService.getCustomerProfile(customerId!);

        return successResponse({
            res,
            statuscode: 200,
            data: { customer }
        });
    };

    /**
     * PATCH profile
     */
    updateCustomerProfile = async (req: Request, res: Response): Promise<Response> => {
        const { customerId } = req.params;

        if (req.customer!.customerId !== customerId) {
            throw new ForbiddenException("You can only modify your own profile");
        }

        const updatedCustomer = await CustomerService.updateCustomerProfile(
            customerId!,
            req.body
        );

        return successResponse({
            res,
            statuscode: 200,
            data: { customer: updatedCustomer }
        });
    };

    /**
     * PATCH password
     */
    updatePassword = async (req: Request, res: Response): Promise<Response> => {
        const { customerId } = req.params;

        if (req.customer!.customerId !== customerId) {
            throw new ForbiddenException("You can only change your own password");
        }

        const { confirmPassword, ...updatePasswordDto } = req.body;

        const result = await CustomerService.updatePassword(customerId!, updatePasswordDto);

        return successResponse({
            res,
            statuscode: 200,
            data: result
        });
    };
}

export default new CustomerController();