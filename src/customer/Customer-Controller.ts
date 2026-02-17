import type { Request, Response } from "express";
import { Types } from "mongoose";
import { BadRequestException, ForbiddenException } from "../utils/error.response";
import { successResponse } from "../utils/success.response";
import CustomerService from "./Customer-Service";
import { uploadFile } from "../utils/s3.config";

class CustomerController {
    constructor() { }

    /**
     * POST /api/customers/register
     * Register a new customer (profile photo required)
     */
    registerCustomer = async (req: Request, res: Response): Promise<Response> => {
        if (!req.file) {
            throw new BadRequestException("Profile photo is required");
        }

        // Pre-generate the customer ID so we can use it in the S3 path
        const customerId = new Types.ObjectId();

        // Upload profile photo to S3 under the customer's folder
        const profilePhotoKey = await uploadFile({
            file: req.file,
            path: `customer/${customerId.toString()}`
        });

        // Extract DTO fields (exclude confirmPassword — already validated by middleware)
        const { confirmPassword, ...registerDto } = req.body;

        // Register customer with pre-generated ID and photo key in a single DB call
        const { customer, token } = await CustomerService.registerCustomer({
            ...registerDto,
            _id: customerId,
            profilePhotoKey,
        });

        return successResponse({
            res,
            statuscode: 201,
            data: {
                customer,
                token,
                photoReceived: {
                    fieldname: req.file.fieldname,
                    originalname: req.file.originalname,
                    mimetype: req.file.mimetype,
                    size: req.file.size
                }
            }
        });
    };

    /**
     * POST /api/customers/upload-verification-photo
     * Upload a verification photo (socket-based verification is a future feature)
     */
    uploadVerificationPhoto = async (req: Request, res: Response): Promise<Response> => {
        const customerId = req.customer?.customerId;

        if (!customerId)
            throw new BadRequestException("Missing customerId from token");

        if (!req.file)
            throw new BadRequestException("Verification photo is required");

        const loginPhotoValue =
            `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

        const updatedCustomer = await CustomerService.updateLoginPhotoValue(
            customerId,
            loginPhotoValue
        );

        return successResponse({
            res,
            statuscode: 200,
            data: { customer: updatedCustomer }
        });
    };



    /**
     * POST /api/customers/login
     * Customer login
     */
    loginCustomer = async (req: Request, res: Response): Promise<Response> => {
        // Call service to login customer (body already validated by middleware)
        const customer = await CustomerService.loginCustomer(req.body);

        return successResponse({
            res,
            statuscode: 200,
            data: { customer }
        });
    };

    /**
     * GET /api/customers/me
     * Validate token and return the authenticated customer's profile
     */
    getMe = async (req: Request, res: Response): Promise<Response> => {
        const customerId = req.customer!.customerId;
        const customer = await CustomerService.getCustomerProfile(customerId);

        return successResponse({
            res,
            statuscode: 200,
            data: { customer }
        });
    };

    /**
     * GET /api/customers/:customerId
     * Get customer profile
     */
    getCustomerProfile = async (req: Request, res: Response): Promise<Response> => {
        const { customerId } = req.params;

        // Verify the authenticated customer owns this resource
        if (req.customer!.customerId !== customerId) {
            throw new ForbiddenException("You can only view your own profile");
        }

        // Call service to get customer profile
        const customer = await CustomerService.getCustomerProfile(customerId!);

        return successResponse({
            res,
            statuscode: 200,
            data: { customer }
        });
    };

    /**
     * PATCH /api/customers/:customerId
     * Update customer profile
     */
    updateCustomerProfile = async (req: Request, res: Response): Promise<Response> => {
        const { customerId } = req.params;

        // Verify the authenticated customer owns this resource
        if (req.customer!.customerId !== customerId) {
            throw new ForbiddenException("You can only modify your own profile");
        }

        // Call service to update customer profile (body already validated by middleware)
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
     * PATCH /api/customers/:customerId/password
     * Update customer password
     */
    updatePassword = async (req: Request, res: Response): Promise<Response> => {
        const { customerId } = req.params;

        // Verify the authenticated customer owns this resource
        if (req.customer!.customerId !== customerId) {
            throw new ForbiddenException("You can only change your own password");
        }

        // Extract DTO fields (exclude confirmPassword — already validated by middleware)
        const { confirmPassword, ...updatePasswordDto } = req.body;

        // Call service to update password
        const result = await CustomerService.updatePassword(customerId!, updatePasswordDto);

        return successResponse({
            res,
            statuscode: 200,
            data: result
        });
    };
}

export default new CustomerController();
