import type { Request, Response } from "express";
import { BadRequestException, ForbiddenException } from "../utils/error.response";
import { successResponse } from "../utils/success.response";
import CustomerService from "./Customer-Service";
import { compressAndEncodePhoto, validatePhotoSize } from "../utils/photo.utils";

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

        // Validate photo size (max 5MB)
        validatePhotoSize(req.file, 5);

        // Convert and aggressively compress photo buffer using sharp
        const profilePhoto = await compressAndEncodePhoto(req.file);

        // Verify that the uploaded profile photo actually contains a face
        const { verifyFaceExists } = await import("../utils/face-comparer");
        const hasFace = await verifyFaceExists(profilePhoto);
        if (!hasFace) {
            throw new BadRequestException("No face detected in the profile photo. Please upload a clear photo of your face.");
        }

        // Extract DTO fields (exclude confirmPassword — already validated by middleware)
        const { confirmPassword, ...bodyFields } = req.body;

        const result = await CustomerService.registerCustomer({
            ...bodyFields,
            profilePhoto,
        });

        return successResponse({
            res,
            statuscode: 201,
            data: result,
            message: "Customer registered successfully"
        });
    };

    /**
     * POST /api/customers/login
     * Customer login
     */
    loginCustomer = async (req: Request, res: Response): Promise<Response> => {
        // Call service to login customer (body already validated by middleware)
        const result = await CustomerService.loginCustomer(req.body);

        return successResponse({
            res,
            statuscode: 200,
            data: result
        });
    };

    /**
     * GET /api/customers/me
     * Get the logged-in customer's own profile without passing an ID
     */
    getMe = async (req: Request, res: Response): Promise<Response> => {
        // Safe to use req.customer!.customerId because authenticateCustomer middleware ensures it
        const customerId = req.customer!.customerId;

        // Call service to get customer profile
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

    // ─── AI Verification Photo ──────────────────────────────────

    /**
     * POST /api/customers/:customerId/verify-photo
     * Submit a live photo for AI-based identity verification.
     * Called after login — the photo is forwarded to the AI service via socket.
     *
     * TODO: Complete socket integration when AI service is ready
     */
    submitVerificationPhoto = async (req: Request, res: Response): Promise<Response> => {
        const { customerId } = req.params;

        // Verify the authenticated customer owns this resource
        if (req.customer!.customerId !== customerId) {
            throw new ForbiddenException("You can only submit your own verification photo");
        }

        // Validate file upload
        if (!req.file) {
            throw new BadRequestException("Verification photo is required");
        }

        // Validate photo size (max 5MB)
        validatePhotoSize(req.file, 5);

        // Convert and aggressively compress photo buffer using sharp
        const photoDataUri = await compressAndEncodePhoto(req.file);

        // Call service to process the verification photo
        const result = await CustomerService.processVerificationPhoto(customerId!, photoDataUri);

        return successResponse({
            res,
            statuscode: 200,
            data: result,
            message: "Verification photo submitted"
        });
    };
}

export default new CustomerController();