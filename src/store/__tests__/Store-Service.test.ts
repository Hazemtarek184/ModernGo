import { describe, expect, test, beforeAll, afterAll, beforeEach } from '@jest/globals';
import StoreService from '../Store-Service';
import { connect, closeDatabase, clearDatabase, seedTestData } from '../../__tests__/utils/testDb';
import { factories, isValidObjectId } from '../../__tests__/utils/testHelpers';
import { BadRequestException, NotFoundException } from '../../utils/error.response';

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

    // ─── Auth Tests ─────────────────────────────────────────────

    describe('registerStore', () => {
        test('should register a new store and return token', async () => {
            const storeData = factories.storeData({
                email: 'newstore@test.com',
                password: 'TestPass123',
            });

            const result = await StoreService.registerStore(storeData);

            expect(result).toHaveProperty('store');
            expect(result).toHaveProperty('token');
            expect(result.store.name).toBe(storeData.name);
            expect(result.store.email).toBe('newstore@test.com');
            expect(result.store).not.toHaveProperty('password');
            expect(typeof result.token).toBe('string');
        });

        test('should throw BadRequestException for duplicate email', async () => {
            const storeData = factories.storeData({
                email: 'duplicate@test.com',
                password: 'TestPass123',
            });

            await StoreService.registerStore(storeData);

            await expect(
                StoreService.registerStore({
                    ...factories.storeData({
                        email: 'duplicate@test.com',
                        password: 'TestPass123',
                    }),
                    name: 'Another Store'
                })
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('loginStore', () => {
        test('should login with valid credentials and return token', async () => {
            // Register first
            await StoreService.registerStore(
                factories.storeData({
                    email: 'logintest@test.com',
                    password: 'TestPass123',
                })
            );

            // Login
            const result = await StoreService.loginStore({
                email: 'logintest@test.com',
                password: 'TestPass123'
            });

            expect(result).toHaveProperty('store');
            expect(result).toHaveProperty('token');
            expect(result.store.email).toBe('logintest@test.com');
            expect(result.store).not.toHaveProperty('password');
        });

        test('should throw BadRequestException for invalid email', async () => {
            await expect(
                StoreService.loginStore({
                    email: 'nonexistent@test.com',
                    password: 'TestPass123'
                })
            ).rejects.toThrow(BadRequestException);
        });

        test('should throw BadRequestException for wrong password', async () => {
            await StoreService.registerStore(
                factories.storeData({
                    email: 'wrongpass@test.com',
                    password: 'TestPass123',
                })
            );

            await expect(
                StoreService.loginStore({
                    email: 'wrongpass@test.com',
                    password: 'WrongPass456'
                })
            ).rejects.toThrow(BadRequestException);
        });
    });

    // ─── CRUD Tests ─────────────────────────────────────────────

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
            expect(stores[0]!.name).toBe('Store 1');
            expect(stores[1]!.name).toBe('Store 2');
            expect(stores[2]!.name).toBe('Store 3');
        });
    });

    describe('getStoreById', () => {
        test('should throw NotFoundException when store does not exist', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            await expect(StoreService.getStoreById(fakeId)).rejects.toThrow(NotFoundException);
        });

        test('should return store when it exists', async () => {
            const createdStore = await seedTestData.createStore({ name: 'Test Store' });
            const store = await StoreService.getStoreById(createdStore._id.toString());

            expect(store).not.toBeNull();
            expect(store.name).toBe('Test Store');
            expect(store._id.toString()).toBe(createdStore._id.toString());
        });
    });

    describe('updateStore', () => {
        test('should throw NotFoundException when updating non-existent store', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            await expect(
                StoreService.updateStore(fakeId, { name: 'Updated' })
            ).rejects.toThrow(NotFoundException);
        });

        test('should update store name', async () => {
            const store = await seedTestData.createStore({ name: 'Original Name' });
            const updated = await StoreService.updateStore(store._id.toString(), {
                name: 'Updated Name'
            });

            expect(updated).not.toBeNull();
            expect((updated as any).name).toBe('Updated Name');
        });

        test('should update store phone', async () => {
            const store = await seedTestData.createStore({ phone: '+201111111111' });
            const updated = await StoreService.updateStore(store._id.toString(), {
                phone: '+202222222222'
            });

            expect((updated as any).phone).toBe('+202222222222');
        });

        test('should update store categories', async () => {
            const store = await seedTestData.createStore({ categories: ['old'] });
            const updated = await StoreService.updateStore(store._id.toString(), {
                categories: ['new1', 'new2']
            });

            expect((updated as any).categories).toEqual(['new1', 'new2']);
        });
    });

    describe('deleteStore', () => {
        test('should throw NotFoundException when deleting non-existent store', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            await expect(StoreService.deleteStore(fakeId)).rejects.toThrow(NotFoundException);
        });

        test('should delete existing store', async () => {
            const store = await seedTestData.createStore({ name: 'To Delete' });
            const deleted = await StoreService.deleteStore(store._id.toString());

            expect(deleted).not.toBeNull();

            // Verify it's actually deleted
            await expect(
                StoreService.getStoreById(store._id.toString())
            ).rejects.toThrow(NotFoundException);
        });
    });

    // ─── Query Tests ────────────────────────────────────────────

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
