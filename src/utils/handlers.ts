import { Response } from "express";
import { Types } from "mongoose";

/**
 * Validates if a string is a valid MongoDB ObjectId
 */
export const isValidObjectId = (id: string): boolean => {
    return Types.ObjectId.isValid(id);
};

/**
 * Validates if multiple IDs are valid MongoDB ObjectIds
 */
export const areValidObjectIds = (ids: string[]): boolean => {
    return ids.every(id => Types.ObjectId.isValid(id));
};

/**
 * Sends a standardized error response
 */
export const sendErrorResponse = (res: Response, statusCode: number, message: string): void => {
    res.status(statusCode).json({
        success: false,
        error: message
    });
};

/**
 * Sends a standardized success response
 */
export const sendSuccessResponse = <T>(res: Response, statusCode: number, data?: T, message?: string): void => {
    const response: any = {
        success: true,
        ...(data && { data }),
        ...(message && { message })
    };
    res.status(statusCode).json(response);
};

/**
 * Validates coordinates [longitude, latitude]
 * Longitude: -180 to 180
 * Latitude: -90 to 90
 */
export const isValidCoordinates = (coordinates: number[]): boolean => {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        return false;
    }

    const [longitude, latitude] = coordinates;

    return (
        typeof longitude === 'number' &&
        typeof latitude === 'number' &&
        longitude >= -180 &&
        longitude <= 180 &&
        latitude >= -90 &&
        latitude <= 90
    );
};

/**
 * Validates phone number format
 * Accepts formats like: +1234567890, (123) 456-7890, 123-456-7890, etc.
 */
export const isValidPhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
};

/**
 * Sanitizes string input by trimming whitespace
 */
export const sanitizeString = (str: string): string => {
    return str.trim();
};

/**
 * Validates required fields in request body
 */
export const validateRequiredFields = (fields: Record<string, any>, requiredFields: string[]): string | null => {
    for (const field of requiredFields) {
        if (!fields[field] || (typeof fields[field] === 'string' && fields[field].trim() === '')) {
            return `${field} is required`;
        }
    }
    return null;
};

/**
 * Calculates distance between two coordinates in meters (Haversine formula)
 */
export const calculateDistance = (
    coord1: [number, number],
    coord2: [number, number]
): number => {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

/**
 * Formats distance to human-readable string
 */
export const formatDistance = (meters: number): string => {
    if (meters < 1000) {
        return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
};

/**
 * Validates category array
 */
export const isValidCategoryArray = (categories: any): boolean => {
    return (
        Array.isArray(categories) &&
        categories.length > 0 &&
        categories.every(cat => typeof cat === 'string' && cat.trim() !== '')
    );
};

/**
 * Parses and validates numeric query parameters
 */
export const parseNumericQuery = (value: any, defaultValue: number, min?: number, max?: number): number => {
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