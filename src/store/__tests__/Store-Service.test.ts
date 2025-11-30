import { describe, expect, test, beforeAll, afterAll, beforeEach } from '@jest/globals';
import * as StoreService from '../Store-Service';
import { connect, closeDatabase, clearDatabase, seedTestData } from '../../__tests__/utils/testDb';
import { factories, isValidObjectId } from '../../__tests__/utils/testHelpers';

describe('Store Service Unit Tests', () => {
    // Setup test database
    beforeAll(async () => {
        await connect();
    });

    afterAll(async () => {
        await closeDatabase();
    });

    beforeEach(async () => {
        await clearDatabase();
    });

    describe('getAllStores', () => {
        test('should return empty array when no stores exist', async () => {
            const stores = await StoreService.getAllStores();
            expect(stores).toEqual([]);
        });

        test('should return all stores when stores exist', async () => {
            await seedTestData.createStore({ name: 'Store 1' });
            await seedTestData.createStore({ name: 'Store 2' });
            await seedTestData.createStore({ name: 'Store 3' });

            const stores = await StoreService.getAllStores();
            expect(stores).toHaveLength(3);
            expect(stores[0].name).toBe('Store 1');
            expect(stores[1].name).toBe('Store 2');
            expect(stores[2].name).toBe('Store 3');
        });
    });

    describe('getStoreById', () => {
        test('should return null when store does not exist', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const store = await StoreService.getStoreById(fakeId);
            expect(store).toBeNull();
        });

        test('should return store when it exists', async () => {
            const createdStore = await seedTestData.createStore({ name: 'Test Store' });
            const store = await StoreService.getStoreById(createdStore._id.toString());

            expect(store).not.toBeNull();
            expect(store?.name).toBe('Test Store');
            expect(store?._id.toString()).toBe(createdStore._id.toString());
        });
    });

    describe('createNewStore', () => {
        test('should create a new store with valid data', async () => {
            const storeData = factories.storeData({ name: 'New Store' });
            const store = await StoreService.createNewStore(storeData);

            expect(store).toBeDefined();
            expect(store.name).toBe('New Store');
            expect(store.address).toBe(storeData.address);
            expect(store.phone).toBe(storeData.phone);
            expect(isValidObjectId(store._id.toString())).toBe(true);
        });

        test('should create store with correct location', async () => {
            const storeData = factories.storeData({
                name: 'Location Test Store',
                location: {
                    type: 'Point',
                    coordinates: [31.5, 30.5]
                }
            });
            const store = await StoreService.createNewStore(storeData);

            expect(store.location.type).toBe('Point');
            expect(store.location.coordinates).toEqual([31.5, 30.5]);
        });

        test('should create store with categories', async () => {
            const storeData = factories.storeData({
                categories: ['food', 'beverages', 'snacks']
            });
            const store = await StoreService.createNewStore(storeData);

            expect(store.categories).toEqual(['food', 'beverages', 'snacks']);
        });
    });

    describe('updateStoreById', () => {
        test('should return null when updating non-existent store', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const result = await StoreService.updateStoreById(fakeId, { name: 'Updated' });
            expect(result).toBeNull();
        });

        test('should update store name', async () => {
            const store = await seedTestData.createStore({ name: 'Original Name' });
            const updated = await StoreService.updateStoreById(store._id.toString(), {
                name: 'Updated Name'
            });

            expect(updated).not.toBeNull();
            expect(updated?.name).toBe('Updated Name');
        });

        test('should update store phone', async () => {
            const store = await seedTestData.createStore({ phone: '+201111111111' });
            const updated = await StoreService.updateStoreById(store._id.toString(), {
                phone: '+202222222222'
            });

            expect(updated?.phone).toBe('+202222222222');
        });

        test('should update store categories', async () => {
            const store = await seedTestData.createStore({ categories: ['old'] });
            const updated = await StoreService.updateStoreById(store._id.toString(), {
                categories: ['new1', 'new2']
            });

            expect(updated?.categories).toEqual(['new1', 'new2']);
        });
    });

    describe('deleteStoreById', () => {
        test('should return null when deleting non-existent store', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const result = await StoreService.deleteStoreById(fakeId);
            expect(result).toBeNull();
        });

        test('should delete existing store', async () => {
            const store = await seedTestData.createStore({ name: 'To Delete' });
            const deleted = await StoreService.deleteStoreById(store._id.toString());

            expect(deleted).not.toBeNull();
            expect(deleted?.name).toBe('To Delete');

            // Verify it's actually deleted
            const found = await StoreService.getStoreById(store._id.toString());
            expect(found).toBeNull();
        });
    });

    describe('searchStoresByNamePattern', () => {
        test('should return empty array when no stores match', async () => {
            await seedTestData.createStore({ name: 'Electronics Store' });
            const results = await StoreService.searchStoresByNamePattern('Food');
            expect(results).toHaveLength(0);
        });

        test('should find stores matching the pattern (case insensitive)', async () => {
            await seedTestData.createStore({ name: 'Best Electronics' });
            await seedTestData.createStore({ name: 'Super Electronics' });
            await seedTestData.createStore({ name: 'Food Market' });

            const results = await StoreService.searchStoresByNamePattern('electronics');
            expect(results).toHaveLength(2);
        });
    });

    describe('findStoresByCategory', () => {
        test('should return empty array when no stores have the category', async () => {
            await seedTestData.createStore({ categories: ['electronics'] });
            const results = await StoreService.findStoresByCategory('food');
            expect(results).toHaveLength(0);
        });

        test('should find stores with specified category', async () => {
            await seedTestData.createStore({ categories: ['electronics', 'gadgets'] });
            await seedTestData.createStore({ categories: ['electronics'] });
            await seedTestData.createStore({ categories: ['food'] });

            const results = await StoreService.findStoresByCategory('electronics');
            expect(results).toHaveLength(2);
        });
    });

    describe('getStoreCount', () => {
        test('should return 0 when no stores exist', async () => {
            const count = await StoreService.getStoreCount();
            expect(count).toBe(0);
        });

        test('should return correct count of stores', async () => {
            await seedTestData.createStore();
            await seedTestData.createStore();
            await seedTestData.createStore();

            const count = await StoreService.getStoreCount();
            expect(count).toBe(3);
        });
    });

    describe('checkStoreExists', () => {
        test('should return false when store does not exist', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const exists = await StoreService.checkStoreExists(fakeId);
            expect(exists).toBe(false);
        });

        test('should return true when store exists', async () => {
            const store = await seedTestData.createStore();
            const exists = await StoreService.checkStoreExists(store._id.toString());
            expect(exists).toBe(true);
        });
    });

    describe('getStoresWithPagination', () => {
        beforeEach(async () => {
            // Create 15 stores for pagination testing
            for (let i = 1; i <= 15; i++) {
                await seedTestData.createStore({ name: `Store ${i}` });
            }
        });

        test('should return first page with correct limit', async () => {
            const result = await StoreService.getStoresWithPagination(1, 5);

            expect(result.stores).toHaveLength(5);
            expect(result.page).toBe(1);
            expect(result.total).toBe(15);
            expect(result.pages).toBe(3);
        });

        test('should return second page correctly', async () => {
            const result = await StoreService.getStoresWithPagination(2, 5);

            expect(result.stores).toHaveLength(5);
            expect(result.page).toBe(2);
            expect(result.total).toBe(15);
            expect(result.pages).toBe(3);
        });

        test('should return last page with remaining items', async () => {
            const result = await StoreService.getStoresWithPagination(3, 5);

            expect(result.stores).toHaveLength(5);
            expect(result.page).toBe(3);
            expect(result.total).toBe(15);
        });

        test('should handle default pagination values', async () => {
            const result = await StoreService.getStoresWithPagination();

            expect(result.stores).toHaveLength(10); // Default limit
            expect(result.page).toBe(1);
            expect(result.total).toBe(15);
        });
    });
});
