import { Request, Response } from "express";
import * as storeService from "./Store-Service";
import {
    isValidObjectId,
    sendErrorResponse,
    sendSuccessResponse,
    validateRequiredFields,
    isValidCoordinates,
    isValidCategoryArray,
    parseNumericQuery
} from "../utils/handlers";

// GET ALL STORES
export const getStores = async (req: Request, res: Response): Promise<void> => {
    try {
        const stores = await storeService.getAllStores();
        sendSuccessResponse(res, 200, { stores });
    } catch (error) {
        console.error("Error fetching stores:", error);
        sendErrorResponse(res, 500, "Internal server error");
    }
};

// GET STORE BY ID
export const getStoreById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { storeId } = req.params;

        if (!storeId) {
            sendErrorResponse(res, 400, "Store ID is required");
            return;
        }

        if (!isValidObjectId(storeId)) {
            sendErrorResponse(res, 400, "Invalid store ID format");
            return;
        }

        const store = await storeService.getStoreById(storeId);

        if (!store) {
            sendErrorResponse(res, 404, "Store not found");
            return;
        }

        sendSuccessResponse(res, 200, { store });
    } catch (error) {
        console.error("Error fetching store:", error);
        sendErrorResponse(res, 500, "Internal server error");
    }
};

// CREATE STORE
export const createStore = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, address, phone, location, categories } = req.body;

        // Validate required fields
        const validationError = validateRequiredFields(
            req.body,
            ['name', 'address', 'phone', 'location', 'categories']
        );

        if (validationError) {
            sendErrorResponse(res, 400, validationError);
            return;
        }

        // Validate coordinates
        if (!isValidCoordinates(location.coordinates)) {
            sendErrorResponse(res, 400, "Invalid location coordinates. Must be [longitude, latitude]");
            return;
        }

        // Validate categories
        if (!isValidCategoryArray(categories)) {
            sendErrorResponse(res, 400, "Categories must be a non-empty array of strings");
            return;
        }

        const newStore = await storeService.createNewStore({
            name,
            address,
            phone,
            location,
            categories
        });

        sendSuccessResponse(res, 201, { store: newStore }, "Store created successfully");
    } catch (error) {
        console.error("Error creating store:", error);
        sendErrorResponse(res, 500, "Internal server error");
    }
};

// UPDATE STORE
export const updateStore = async (req: Request, res: Response): Promise<void> => {
    try {
        const { storeId } = req.params;
        const updateData = req.body;

        if (!storeId) {
            sendErrorResponse(res, 400, "Store ID is required");
            return;
        }

        if (!isValidObjectId(storeId)) {
            sendErrorResponse(res, 400, "Invalid store ID format");
            return;
        }

        // Check if update data is empty
        if (Object.keys(updateData).length === 0) {
            sendErrorResponse(res, 400, "No update data provided");
            return;
        }

        // Validate name if provided
        if (updateData.name !== undefined) {
            if (typeof updateData.name !== 'string' || updateData.name.trim() === '') {
                sendErrorResponse(res, 400, "Name must be a non-empty string");
                return;
            }
        }

        // Validate address if provided
        if (updateData.address !== undefined) {
            if (typeof updateData.address !== 'string' || updateData.address.trim() === '') {
                sendErrorResponse(res, 400, "Address must be a non-empty string");
                return;
            }
        }

        // Validate phone if provided
        if (updateData.phone !== undefined) {
            if (typeof updateData.phone !== 'string' || updateData.phone.trim() === '') {
                sendErrorResponse(res, 400, "Phone must be a non-empty string");
                return;
            }
        }

        // Validate location if provided
        if (updateData.location !== undefined) {
            if (!updateData.location.coordinates || !isValidCoordinates(updateData.location.coordinates)) {
                sendErrorResponse(res, 400, "Invalid location coordinates. Must be [longitude, latitude]");
                return;
            }
        }

        // Validate categories if provided
        if (updateData.categories !== undefined) {
            if (!isValidCategoryArray(updateData.categories)) {
                sendErrorResponse(res, 400, "Categories must be a non-empty array of strings");
                return;
            }
        }

        const updatedStore = await storeService.updateStoreById(storeId, updateData);

        if (!updatedStore) {
            sendErrorResponse(res, 404, "Store not found");
            return;
        }

        sendSuccessResponse(res, 200, { store: updatedStore }, "Store updated successfully");
    } catch (error) {
        console.error("Error updating store:", error);
        sendErrorResponse(res, 500, "Internal server error");
    }
};

// DELETE STORE
export const deleteStore = async (req: Request, res: Response): Promise<void> => {
    try {
        const { storeId } = req.params;

        if (!storeId) {
            sendErrorResponse(res, 400, "Store ID is required");
            return;
        }

        if (!isValidObjectId(storeId)) {
            sendErrorResponse(res, 400, "Invalid store ID format");
            return;
        }

        const deletedStore = await storeService.deleteStoreById(storeId);

        if (!deletedStore) {
            sendErrorResponse(res, 404, "Store not found");
            return;
        }

        sendSuccessResponse(res, 200, undefined, "Store deleted successfully");
    } catch (error) {
        console.error("Error deleting store:", error);
        sendErrorResponse(res, 500, "Internal server error");
    }
};

// GET NEARBY STORES
export const getStoresNearby = async (req: Request, res: Response): Promise<void> => {
    try {
        const { longitude, latitude, maxDistance } = req.query;

        if (!longitude || !latitude) {
            sendErrorResponse(res, 400, "Longitude and latitude are required");
            return;
        }

        const lon = parseFloat(longitude as string);
        const lat = parseFloat(latitude as string);
        const distance = parseNumericQuery(maxDistance, 5000, 100, 50000);

        if (isNaN(lon) || isNaN(lat)) {
            sendErrorResponse(res, 400, "Invalid coordinates format");
            return;
        }

        if (!isValidCoordinates([lon, lat])) {
            sendErrorResponse(res, 400, "Invalid coordinate values");
            return;
        }

        const stores = await storeService.findStoresNearLocation(lon, lat, distance);

        sendSuccessResponse(res, 200, { stores, count: stores.length });
    } catch (error) {
        console.error("Error fetching nearby stores:", error);
        sendErrorResponse(res, 500, "Internal server error");
    }
};

// SEARCH STORES BY NAME
export const searchStoresByName = async (req: Request, res: Response): Promise<void> => {
    try {
        const { query } = req.query;

        if (!query || typeof query !== 'string' || query.trim() === '') {
            sendErrorResponse(res, 400, "Search query is required");
            return;
        }

        const stores = await storeService.searchStoresByNamePattern(query as string);

        sendSuccessResponse(res, 200, { stores, count: stores.length });
    } catch (error) {
        console.error("Error searching stores:", error);
        sendErrorResponse(res, 500, "Internal server error");
    }
};

// GET STORES BY CATEGORY
export const getStoresByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { category } = req.params;

        if (!category || category.trim() === '') {
            sendErrorResponse(res, 400, "Category is required");
            return;
        }

        const stores = await storeService.findStoresByCategory(category);

        sendSuccessResponse(res, 200, { stores, count: stores.length });
    } catch (error) {
        console.error("Error fetching stores by category:", error);
        sendErrorResponse(res, 500, "Internal server error");
    }
};