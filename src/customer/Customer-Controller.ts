import type { Request, Response } from "express";
import { BadRequestException, ForbiddenException } from "../utils/error.response";
import { successResponse } from "../utils/success.response";
import CustomerService from "./Customer-Service";

class CustomerController {
    constructor() { }

    /**
     * POST /api/customers/register
     * Register a new customer
     */
    registerCustomer = async (req: Request, res: Response): Promise<Response> => {
        // Validate file upload
        if (!req.file) {
            throw new BadRequestException("Profile photo is required");
        }

        // Extract DTO fields (exclude confirmPassword — already validated by middleware)
        const { confirmPassword, ...registerDto } = req.body;

        // Call service to register customer (file available in req.file for future implementation)
        const customer = await CustomerService.registerCustomer(registerDto);

        return successResponse({
            res,
            statuscode: 201,
            data: {
                customer,
                // For debugging/development - show that file was received
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
