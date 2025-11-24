"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoresByCategory = exports.searchStoresByName = exports.getStoresNearby = exports.deleteStore = exports.updateStore = exports.createStore = exports.getStoreById = exports.getStores = void 0;
const storeService = __importStar(require("./Store-Service"));
const handlers_1 = require("../utils/handlers");
const getStores = async (req, res) => {
    try {
        const stores = await storeService.getAllStores();
        (0, handlers_1.sendSuccessResponse)(res, 200, { stores });
    }
    catch (error) {
        console.error("Error fetching stores:", error);
        (0, handlers_1.sendErrorResponse)(res, 500, "Internal server error");
    }
};
exports.getStores = getStores;
const getStoreById = async (req, res) => {
    try {
        const { storeId } = req.params;
        if (!storeId) {
            (0, handlers_1.sendErrorResponse)(res, 400, "Store ID is required");
            return;
        }
        if (!(0, handlers_1.isValidObjectId)(storeId)) {
            (0, handlers_1.sendErrorResponse)(res, 400, "Invalid store ID format");
            return;
        }
        const store = await storeService.getStoreById(storeId);
        if (!store) {
            (0, handlers_1.sendErrorResponse)(res, 404, "Store not found");
            return;
        }
        (0, handlers_1.sendSuccessResponse)(res, 200, { store });
    }
    catch (error) {
        console.error("Error fetching store:", error);
        (0, handlers_1.sendErrorResponse)(res, 500, "Internal server error");
    }
};
exports.getStoreById = getStoreById;
const createStore = async (req, res) => {
    try {
        const { name, address, phone, location, categories } = req.body;
        const validationError = (0, handlers_1.validateRequiredFields)(req.body, ['name', 'address', 'phone', 'location', 'categories']);
        if (validationError) {
            (0, handlers_1.sendErrorResponse)(res, 400, validationError);
            return;
        }
        if (!(0, handlers_1.isValidCoordinates)(location.coordinates)) {
            (0, handlers_1.sendErrorResponse)(res, 400, "Invalid location coordinates. Must be [longitude, latitude]");
            return;
        }
        if (!(0, handlers_1.isValidCategoryArray)(categories)) {
            (0, handlers_1.sendErrorResponse)(res, 400, "Categories must be a non-empty array of strings");
            return;
        }
        const newStore = await storeService.createNewStore({
            name,
            address,
            phone,
            location,
            categories
        });
        (0, handlers_1.sendSuccessResponse)(res, 201, { store: newStore }, "Store created successfully");
    }
    catch (error) {
        console.error("Error creating store:", error);
        (0, handlers_1.sendErrorResponse)(res, 500, "Internal server error");
    }
};
exports.createStore = createStore;
const updateStore = async (req, res) => {
    try {
        const { storeId } = req.params;
        const updateData = req.body;
        if (!storeId) {
            (0, handlers_1.sendErrorResponse)(res, 400, "Store ID is required");
            return;
        }
        if (!(0, handlers_1.isValidObjectId)(storeId)) {
            (0, handlers_1.sendErrorResponse)(res, 400, "Invalid store ID format");
            return;
        }
        if (Object.keys(updateData).length === 0) {
            (0, handlers_1.sendErrorResponse)(res, 400, "No update data provided");
            return;
        }
        if (updateData.name !== undefined) {
            if (typeof updateData.name !== 'string' || updateData.name.trim() === '') {
                (0, handlers_1.sendErrorResponse)(res, 400, "Name must be a non-empty string");
                return;
            }
        }
        if (updateData.address !== undefined) {
            if (typeof updateData.address !== 'string' || updateData.address.trim() === '') {
                (0, handlers_1.sendErrorResponse)(res, 400, "Address must be a non-empty string");
                return;
            }
        }
        if (updateData.phone !== undefined) {
            if (typeof updateData.phone !== 'string' || updateData.phone.trim() === '') {
                (0, handlers_1.sendErrorResponse)(res, 400, "Phone must be a non-empty string");
                return;
            }
        }
        if (updateData.location !== undefined) {
            if (!updateData.location.coordinates || !(0, handlers_1.isValidCoordinates)(updateData.location.coordinates)) {
                (0, handlers_1.sendErrorResponse)(res, 400, "Invalid location coordinates. Must be [longitude, latitude]");
                return;
            }
        }
        if (updateData.categories !== undefined) {
            if (!(0, handlers_1.isValidCategoryArray)(updateData.categories)) {
                (0, handlers_1.sendErrorResponse)(res, 400, "Categories must be a non-empty array of strings");
                return;
            }
        }
        const updatedStore = await storeService.updateStoreById(storeId, updateData);
        if (!updatedStore) {
            (0, handlers_1.sendErrorResponse)(res, 404, "Store not found");
            return;
        }
        (0, handlers_1.sendSuccessResponse)(res, 200, { store: updatedStore }, "Store updated successfully");
    }
    catch (error) {
        console.error("Error updating store:", error);
        (0, handlers_1.sendErrorResponse)(res, 500, "Internal server error");
    }
};
exports.updateStore = updateStore;
const deleteStore = async (req, res) => {
    try {
        const { storeId } = req.params;
        if (!storeId) {
            (0, handlers_1.sendErrorResponse)(res, 400, "Store ID is required");
            return;
        }
        if (!(0, handlers_1.isValidObjectId)(storeId)) {
            (0, handlers_1.sendErrorResponse)(res, 400, "Invalid store ID format");
            return;
        }
        const deletedStore = await storeService.deleteStoreById(storeId);
        if (!deletedStore) {
            (0, handlers_1.sendErrorResponse)(res, 404, "Store not found");
            return;
        }
        (0, handlers_1.sendSuccessResponse)(res, 200, undefined, "Store deleted successfully");
    }
    catch (error) {
        console.error("Error deleting store:", error);
        (0, handlers_1.sendErrorResponse)(res, 500, "Internal server error");
    }
};
exports.deleteStore = deleteStore;
const getStoresNearby = async (req, res) => {
    try {
        const { longitude, latitude, maxDistance } = req.query;
        if (!longitude || !latitude) {
            (0, handlers_1.sendErrorResponse)(res, 400, "Longitude and latitude are required");
            return;
        }
        const lon = parseFloat(longitude);
        const lat = parseFloat(latitude);
        const distance = (0, handlers_1.parseNumericQuery)(maxDistance, 5000, 100, 50000);
        if (isNaN(lon) || isNaN(lat)) {
            (0, handlers_1.sendErrorResponse)(res, 400, "Invalid coordinates format");
            return;
        }
        if (!(0, handlers_1.isValidCoordinates)([lon, lat])) {
            (0, handlers_1.sendErrorResponse)(res, 400, "Invalid coordinate values");
            return;
        }
        const stores = await storeService.findStoresNearLocation(lon, lat, distance);
        (0, handlers_1.sendSuccessResponse)(res, 200, { stores, count: stores.length });
    }
    catch (error) {
        console.error("Error fetching nearby stores:", error);
        (0, handlers_1.sendErrorResponse)(res, 500, "Internal server error");
    }
};
exports.getStoresNearby = getStoresNearby;
const searchStoresByName = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || typeof query !== 'string' || query.trim() === '') {
            (0, handlers_1.sendErrorResponse)(res, 400, "Search query is required");
            return;
        }
        const stores = await storeService.searchStoresByNamePattern(query);
        (0, handlers_1.sendSuccessResponse)(res, 200, { stores, count: stores.length });
    }
    catch (error) {
        console.error("Error searching stores:", error);
        (0, handlers_1.sendErrorResponse)(res, 500, "Internal server error");
    }
};
exports.searchStoresByName = searchStoresByName;
const getStoresByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        if (!category || category.trim() === '') {
            (0, handlers_1.sendErrorResponse)(res, 400, "Category is required");
            return;
        }
        const stores = await storeService.findStoresByCategory(category);
        (0, handlers_1.sendSuccessResponse)(res, 200, { stores, count: stores.length });
    }
    catch (error) {
        console.error("Error fetching stores by category:", error);
        (0, handlers_1.sendErrorResponse)(res, 500, "Internal server error");
    }
};
exports.getStoresByCategory = getStoresByCategory;
//# sourceMappingURL=Store-Controller.js.map