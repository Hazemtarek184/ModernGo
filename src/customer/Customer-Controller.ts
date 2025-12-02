import type { Request, Response } from "express";
import * as validators from "./Customer-Validation";
import { BadRequestException } from "../utils/error.response";
import { successResponse } from "../utils/success.response";
import CustomerService from "./Customer-Service";

class CustomerController {
    constructor() { }

    /**
     * POST /api/customers/register
     * Register a new customer
     */
    registerCustomer = async (req: Request, res: Response): Promise<Response> => {
        // Validate request body
        const validationResult = validators.registerCustomerSchema.body.safeParse(req.body);
        if (!validationResult.success) {
            throw new BadRequestException("Validation Error", {
                issues: JSON.parse(validationResult.error as unknown as string)
            });
        }

        // Extract DTO fields (exclude confirmPassword)
        const { confirmPassword, ...registerDto } = validationResult.data;

        // Call service to register customer
        const customer = await CustomerService.registerCustomer(registerDto);

        return successResponse({
            res,
            statuscode: 201,
            data: { customer }
        });
    };

    /**
     * POST /api/customers/login
     * Customer login
     */
    loginCustomer = async (req: Request, res: Response): Promise<Response> => {
        // Validate request body
        const validationResult = validators.loginCustomerSchema.body.safeParse(req.body);
        if (!validationResult.success) {
            throw new BadRequestException("Validation Error", {
                issues: JSON.parse(validationResult.error as unknown as string)
            });
        }

        // Call service to login customer
        const customer = await CustomerService.loginCustomer(validationResult.data);

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

        if (!customerId) {
            throw new BadRequestException("Customer ID is required");
        }

        // Call service to get customer profile
        const customer = await CustomerService.getCustomerProfile(customerId);

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

        if (!customerId) {
            throw new BadRequestException("Customer ID is required");
        }

        // Validate request body
        const validationResult = validators.updateCustomerSchema.body.safeParse(req.body);
        if (!validationResult.success) {
            throw new BadRequestException("Validation Error", {
                issues: JSON.parse(validationResult.error as unknown as string)
            });
        }

        // Call service to update customer profile
        const updatedCustomer = await CustomerService.updateCustomerProfile(
            customerId,
            validationResult.data
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

        if (!customerId) {
            throw new BadRequestException("Customer ID is required");
        }

        // Validate request body
        const validationResult = validators.updatePasswordSchema.body.safeParse(req.body);
        if (!validationResult.success) {
            throw new BadRequestException("Validation Error", {
                issues: JSON.parse(validationResult.error as unknown as string)
            });
        }

        // Extract DTO fields (exclude confirmPassword)
        const { confirmPassword, ...updatePasswordDto } = validationResult.data;

        // Call service to update password
        const result = await CustomerService.updatePassword(customerId, updatePasswordDto);

        return successResponse({
            res,
            statuscode: 200,
            data: result
        });
    };
}

export default new CustomerController();
