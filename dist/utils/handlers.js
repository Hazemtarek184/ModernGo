"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseNumericQuery = exports.isValidCategoryArray = exports.formatDistance = exports.calculateDistance = exports.validateRequiredFields = exports.sanitizeString = exports.isValidPhoneNumber = exports.isValidCoordinates = exports.sendSuccessResponse = exports.sendErrorResponse = exports.areValidObjectIds = exports.isValidObjectId = void 0;
const mongoose_1 = require("mongoose");
const isValidObjectId = (id) => {
    return mongoose_1.Types.ObjectId.isValid(id);
};
exports.isValidObjectId = isValidObjectId;
const areValidObjectIds = (ids) => {
    return ids.every(id => mongoose_1.Types.ObjectId.isValid(id));
};
exports.areValidObjectIds = areValidObjectIds;
const sendErrorResponse = (res, statusCode, message) => {
    res.status(statusCode).json({
        success: false,
        error: message
    });
};
exports.sendErrorResponse = sendErrorResponse;
const sendSuccessResponse = (res, statusCode, data, message) => {
    const response = {
        success: true,
        ...(data && { data }),
        ...(message && { message })
    };
    res.status(statusCode).json(response);
};
exports.sendSuccessResponse = sendSuccessResponse;
const isValidCoordinates = (coordinates) => {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        return false;
    }
    const [longitude, latitude] = coordinates;
    return (typeof longitude === 'number' &&
        typeof latitude === 'number' &&
        longitude >= -180 &&
        longitude <= 180 &&
        latitude >= -90 &&
        latitude <= 90);
};
exports.isValidCoordinates = isValidCoordinates;
const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
};
exports.isValidPhoneNumber = isValidPhoneNumber;
const sanitizeString = (str) => {
    return str.trim();
};
exports.sanitizeString = sanitizeString;
const validateRequiredFields = (fields, requiredFields) => {
    for (const field of requiredFields) {
        if (!fields[field] || (typeof fields[field] === 'string' && fields[field].trim() === '')) {
            return `${field} is required`;
        }
    }
    return null;
};
exports.validateRequiredFields = validateRequiredFields;
const calculateDistance = (coord1, coord2) => {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
exports.calculateDistance = calculateDistance;
const formatDistance = (meters) => {
    if (meters < 1000) {
        return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
};
exports.formatDistance = formatDistance;
const isValidCategoryArray = (categories) => {
    return (Array.isArray(categories) &&
        categories.length > 0 &&
        categories.every(cat => typeof cat === 'string' && cat.trim() !== ''));
};
exports.isValidCategoryArray = isValidCategoryArray;
const parseNumericQuery = (value, defaultValue, min, max) => {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
        return defaultValue;
    }
    if (min !== undefined && parsed < min) {
        return min;
    }
    if (max !== undefined && parsed > max) {
        return max;
    }
    return parsed;
};
exports.parseNumericQuery = parseNumericQuery;
//# sourceMappingURL=handlers.js.map