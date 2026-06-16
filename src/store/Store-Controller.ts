import type { Request, Response } from "express";
import { successResponse } from "../utils/success.response";
import { ForbiddenException, BadRequestException } from "../utils/error.response";
import StoreService from "./Store-Service";
import { compressAndEncodePhoto, validatePhotoSize } from "../utils/photo.utils";

class StoreController {
    constructor() { }

    /**
     * POST /api/stores/register
     * Register a new store
     */
    registerStore = async (req: Request, res: Response): Promise<Response> => {
        let profilePhoto: string | undefined;

        if (req.file) {
            validatePhotoSize(req.file, 5);
            profilePhoto = await compressAndEncodePhoto(req.file);
        }

        const { confirmPassword, ...bodyFields } = req.body;

        const result = await StoreService.registerStore({
            ...bodyFields,
            ...(profilePhoto !== undefined && { profilePhoto }),
        });

        return successResponse({
            res,
            statuscode: 201,
            data: result,
            message: "Store registered successfully"
        });
    };

    /**
     * POST /api/stores/login
     * Store login
     */
    loginStore = async (req: Request, res: Response): Promise<Response> => {
        const result = await StoreService.loginStore(req.body);

        return successResponse({
            res,
            statuscode: 200,
            data: result
        });
    };

    /**
     * GET /api/stores
     * Get all stores
     */
    getStores = async (req: Request, res: Response): Promise<Response> => {
        const stores = await StoreService.getAllStores();

        return successResponse({
            res,
            statuscode: 200,
            data: { stores }
        });
    };

    /**
     * GET /api/stores/:storeId
     * Get store by ID
     */
    getStoreById = async (req: Request, res: Response): Promise<Response> => {
        const { storeId } = req.params;
        const store = await StoreService.getStoreById(storeId!);

        return successResponse({
            res,
            statuscode: 200,
            data: { store }
        });
    };

    /**
     * PUT /api/stores/:storeId
     * Update store
     */
    updateStore = async (req: Request, res: Response): Promise<Response> => {
        const { storeId } = req.params;

        // Verify the authenticated store owns this resource
        if (req.store!.storeId !== storeId) {
            throw new ForbiddenException("You can only modify your own store");
        }

        const updatedStore = await StoreService.updateStore(storeId!, req.body);

        return successResponse({
            res,
            statuscode: 200,
            data: { store: updatedStore },
            message: "Store updated successfully"
        });
    };

    /**
     * DELETE /api/stores/:storeId
     * Delete store
     */
    deleteStore = async (req: Request, res: Response): Promise<Response> => {
        const { storeId } = req.params;

        // Verify the authenticated store owns this resource
        if (req.store!.storeId !== storeId) {
            throw new ForbiddenException("You can only delete your own store");
        }

        await StoreService.deleteStore(storeId!);

        return successResponse({
            res,
            statuscode: 200,
            message: "Store deleted successfully"
        });
    };

    /**
     * GET /api/stores/nearby
     * Get nearby stores
     */
    getStoresNearby = async (req: Request, res: Response): Promise<Response> => {
        const longitude = parseFloat(req.query.longitude as string);
        const latitude = parseFloat(req.query.latitude as string);
        const maxDistance = req.query.maxDistance
            ? parseFloat(req.query.maxDistance as string)
            : 5000;

        const stores = await StoreService.findStoresNearLocation(longitude, latitude, maxDistance);

        return successResponse({
            res,
            statuscode: 200,
            data: { stores, count: stores.length }
        });
    };

    /**
     * GET /api/stores/search
     * Search stores by name
     */
    searchStoresByName = async (req: Request, res: Response): Promise<Response> => {
        const { query } = req.query;
        const stores = await StoreService.searchStoresByNamePattern(query as string);

        return successResponse({
            res,
            statuscode: 200,
            data: { stores, count: stores.length }
        });
    };

    /**
     * GET /api/stores/category/:category
     * Get stores by category
     */
    getStoresByCategory = async (req: Request, res: Response): Promise<Response> => {
        const { category } = req.params;
        const stores = await StoreService.findStoresByCategory(category!);

        return successResponse({
            res,
            statuscode: 200,
            data: { stores, count: stores.length }
        });
    };

    /**
     * PATCH /api/stores/:storeId/password
     * Update store password
     */
    updatePassword = async (req: Request, res: Response): Promise<Response> => {
        const { storeId } = req.params;

        // Verify the authenticated store owns this resource
        if (req.store!.storeId !== storeId) {
            throw new ForbiddenException("You can only change your own password");
        }

        const result = await StoreService.updatePassword(storeId!, req.body);

        return successResponse({
            res,
            statuscode: 200,
            data: result
        });
    };

    /**
     * POST /api/stores/:storeId/profile-image
     * Upload/update store profile photo
     */
    updateProfilePhoto = async (req: Request, res: Response): Promise<Response> => {
        const { storeId } = req.params;

        // Verify the authenticated store owns this resource
        if (req.store!.storeId !== storeId) {
            throw new ForbiddenException("You can only modify your own store");
        }

        if (!req.file) {
            throw new BadRequestException("Profile photo is required");
        }

        validatePhotoSize(req.file, 5);
        const profilePhoto = await compressAndEncodePhoto(req.file);

        const updatedStore = await StoreService.updateProfilePhoto(storeId!, profilePhoto);

        return successResponse({
            res,
            statuscode: 200,
            data: { store: updatedStore },
            message: "Profile photo updated successfully"
        });
    };

    /**
     * DELETE /api/stores/:storeId/profile-image
     * Delete store profile photo
     */
    deleteProfilePhoto = async (req: Request, res: Response): Promise<Response> => {
        const { storeId } = req.params;

        // Verify the authenticated store owns this resource
        if (req.store!.storeId !== storeId) {
            throw new ForbiddenException("You can only modify your own store");
        }

        const updatedStore = await StoreService.deleteProfilePhoto(storeId!);

        return successResponse({
            res,
            statuscode: 200,
            data: { store: updatedStore },
            message: "Profile photo deleted successfully"
        });
    };
}

export default new StoreController();
