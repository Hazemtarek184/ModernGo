import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer | null = null;

/**
 * Connect to the in-memory database
 */
export const connect = async (): Promise<void> => {
    // Create an instance of MongoMemoryServer
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);
};

/**
 * Drop database, close the connection and stop mongod
 */
export const closeDatabase = async (): Promise<void> => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    }
    if (mongoServer) {
        await mongoServer.stop();
    }
};

/**
 * Remove all the data for all db collections
 */
export const clearDatabase = async (): Promise<void> => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
};

// Simple UUID generator for tests (no external dependencies)
const generateTestUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * Seed test data
 */
export const seedTestData = {
    /**
     * Create a test store
     */
    createStore: async (overrides: any = {}) => {
        const { storeModel } = require('../../store/Store-Module');
        return await storeModel.create({
            name: 'Test Store',
            address: '123 Test St, Test City',
            phone: '+201234567890',
            location: {
                type: 'Point',
                coordinates: [31.2357, 30.0444], // Cairo coordinates
                address: '123 Test St, Test City'
            },
            categories: ['electronics', 'gadgets'],
            ...overrides
        });
    },

    /**
     * Create a test product
     */
    createProduct: async (overrides: any = {}) => {
        const { ProductModel } = require('../../product/product.module');
        return await ProductModel.create({
            name: 'Test Product',
            slug: 'test-product',
            description: 'A test product description',
            mainPrice: 99.99,
            discountPercent: 0,
            salePrice: 99.99,
            stock: 10,
            soldItems: 0,
            images: [],
            assistFolderId: generateTestUUID(),
            ...overrides
        });
    },

    /**
     * Create a store-product relationship
     */
    createStoreProduct: async (storeId: any, productId: any, overrides: any = {}) => {
        const { StoreProductModel } = require('../../store-product/StoreProduct-Module');
        return await StoreProductModel.create({
            storeId,
            productId,
            price: 99.99,
            stock: 10,
            isAvailable: true,
            ...overrides
        });
    }
};
