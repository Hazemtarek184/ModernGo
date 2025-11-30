import { Types } from 'mongoose';
import express, { Express } from 'express';
import bodyParser from 'body-parser';

/**
 * Create a valid MongoDB ObjectId
 */
export const createObjectId = (id?: string): Types.ObjectId => {
    return id ? new Types.ObjectId(id) : new Types.ObjectId();
};

/**
 * Create a test Express app for integration tests
 */
export const createTestApp = (): Express => {
    const app = express();

    app.use(express.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    return app;
};

/**
 * Wait for a specified amount of time
 */
export const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Validate MongoDB ObjectId
 */
export const isValidObjectId = (id: string): boolean => {
    return Types.ObjectId.isValid(id);
};

/**
 * Extract error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'Unknown error';
};

/**
 * Factory functions for creating test data
 */
export const factories = {
    /**
     * Generate store data
     */
    storeData: (overrides: any = {}) => ({
        name: 'Test Store',
        address: '123 Test Street, Test City',
        phone: '+201234567890',
        location: {
            type: 'Point' as const,
            coordinates: [31.2357, 30.0444], // Cairo coordinates
            address: '123 Test Street, Test City'
        },
        categories: ['electronics', 'gadgets'],
        ...overrides
    }),

    /**
     * Generate product data
     */
    productData: (overrides: any = {}) => ({
        name: 'Test Product',
        description: 'A comprehensive test product description',
        category: 'electronics',
        brand: 'TestBrand',
        sku: `TEST-${Date.now()}`,
        ...overrides
    }),

    /**
     * Generate store-product data
     */
    storeProductData: (storeId: Types.ObjectId, productId: Types.ObjectId, overrides: any = {}) => ({
        storeId,
        productId,
        price: 99.99,
        stock: 10,
        isAvailable: true,
        ...overrides
    })
};
