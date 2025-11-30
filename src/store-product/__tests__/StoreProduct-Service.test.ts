import { describe, expect, test, beforeAll, afterAll, beforeEach } from '@jest/globals';
import StoreProductService from '../StoreProduct-Service';
import { connect, closeDatabase, clearDatabase, seedTestData } from '../../__tests__/utils/testDb';
import { BadRequestException, NotFoundException } from '../../utils/error.response';

describe('StoreProduct Service Unit Tests', () => {
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

    describe('addProductToStore', () => {
        test('should successfully add a product to a store', async () => {
            const store = await seedTestData.createStore({ name: 'Test Store' });
            const product = await seedTestData.createProduct({ name: 'Test Product' });

            const storeProduct = await StoreProductService.addProductToStore(
                store._id.toString(),
                product._id.toString(),
                99.99,
                10,
                true
            );

            expect(storeProduct).toBeDefined();
            expect(storeProduct.storeId.toString()).toBe(store._id.toString());
            expect(storeProduct.productId.toString()).toBe(product._id.toString());
            expect(storeProduct.price).toBe(99.99);
            expect(storeProduct.stock).toBe(10);
            expect(storeProduct.isAvailable).toBe(true);
        });

        test('should throw NotFoundException when store does not exist', async () => {
            const product = await seedTestData.createProduct();
            const fakeStoreId = '507f1f77bcf86cd799439011';

            await expect(
                StoreProductService.addProductToStore(fakeStoreId, product._id.toString(), 99.99, 10)
            ).rejects.toThrow(NotFoundException);

            await expect(
                StoreProductService.addProductToStore(fakeStoreId, product._id.toString(), 99.99, 10)
            ).rejects.toThrow('Store not found');
        });

        test('should throw NotFoundException when product does not exist', async () => {
            const store = await seedTestData.createStore();
            const fakeProductId = '507f1f77bcf86cd799439011';

            await expect(
                StoreProductService.addProductToStore(store._id.toString(), fakeProductId, 99.99, 10)
            ).rejects.toThrow(NotFoundException);

            await expect(
                StoreProductService.addProductToStore(store._id.toString(), fakeProductId, 99.99, 10)
            ).rejects.toThrow('Product not found');
        });

        test('should add product with custom availability', async () => {
            const store = await seedTestData.createStore();
            const product = await seedTestData.createProduct();

            const storeProduct = await StoreProductService.addProductToStore(
                store._id.toString(),
                product._id.toString(),
                49.99,
                5,
                false // Not available
            );

            expect(storeProduct.isAvailable).toBe(false);
            expect(storeProduct.price).toBe(49.99);
            expect(storeProduct.stock).toBe(5);
        });
    });

    describe('getStoreProducts', () => {
        test('should throw NotFoundException when store does not exist', async () => {
            const fakeStoreId = '507f1f77bcf86cd799439011';

            await expect(
                StoreProductService.getStoreProducts(fakeStoreId)
            ).rejects.toThrow(NotFoundException);

            await expect(
                StoreProductService.getStoreProducts(fakeStoreId)
            ).rejects.toThrow('Store not found');
        });

        test('should return empty array when store has no products', async () => {
            const store = await seedTestData.createStore();
            const products = await StoreProductService.getStoreProducts(store._id.toString());

            expect(products).toEqual([]);
        });

        test('should return all products for a store', async () => {
            const store = await seedTestData.createStore();
            const product1 = await seedTestData.createProduct({ name: 'Product 1' });
            const product2 = await seedTestData.createProduct({ name: 'Product 2' });

            await seedTestData.createStoreProduct(store._id, product1._id, { price: 10 });
            await seedTestData.createStoreProduct(store._id, product2._id, { price: 20 });

            const products = await StoreProductService.getStoreProducts(store._id.toString());

            expect(products).toHaveLength(2);
            expect(products[0].storeId.toString()).toBe(store._id.toString());
            expect(products[1].storeId.toString()).toBe(store._id.toString());
        });

        test('should populate product details', async () => {
            const store = await seedTestData.createStore();
            const product = await seedTestData.createProduct({ name: 'Detailed Product' });

            await seedTestData.createStoreProduct(store._id, product._id);

            const products = await StoreProductService.getStoreProducts(store._id.toString());

            expect(products).toHaveLength(1);
            expect(products[0].productId).toBeDefined();
            // The productId should be populated with product details
        });
    });

    describe('getProductStores', () => {
        test('should throw NotFoundException when product does not exist', async () => {
            const fakeProductId = '507f1f77bcf86cd799439011';

            await expect(
                StoreProductService.getProductStores(fakeProductId)
            ).rejects.toThrow(NotFoundException);

            await expect(
                StoreProductService.getProductStores(fakeProductId)
            ).rejects.toThrow('Product not found');
        });

        test('should return empty array when product is in no stores', async () => {
            const product = await seedTestData.createProduct();
            const stores = await StoreProductService.getProductStores(product._id.toString());

            expect(stores).toEqual([]);
        });

        test('should return all stores selling a product', async () => {
            const product = await seedTestData.createProduct();
            const store1 = await seedTestData.createStore({ name: 'Store 1' });
            const store2 = await seedTestData.createStore({ name: 'Store 2' });

            await seedTestData.createStoreProduct(store1._id, product._id, { price: 100 });
            await seedTestData.createStoreProduct(store2._id, product._id, { price: 120 });

            const stores = await StoreProductService.getProductStores(product._id.toString());

            expect(stores).toHaveLength(2);
            expect(stores[0].productId.toString()).toBe(product._id.toString());
            expect(stores[1].productId.toString()).toBe(product._id.toString());
        });
    });

    describe('updateStoreProduct', () => {
        test('should throw NotFoundException when relationship does not exist', async () => {
            const store = await seedTestData.createStore();
            const product = await seedTestData.createProduct();

            await expect(
                StoreProductService.updateStoreProduct(
                    store._id.toString(),
                    product._id.toString(),
                    { price: 150 }
                )
            ).rejects.toThrow(NotFoundException);

            await expect(
                StoreProductService.updateStoreProduct(
                    store._id.toString(),
                    product._id.toString(),
                    { price: 150 }
                )
            ).rejects.toThrow('Store-Product relationship not found');
        });

        test('should update price successfully', async () => {
            const store = await seedTestData.createStore();
            const product = await seedTestData.createProduct();
            await seedTestData.createStoreProduct(store._id, product._id, { price: 100 });

            const updated = await StoreProductService.updateStoreProduct(
                store._id.toString(),
                product._id.toString(),
                { price: 150 }
            );

            expect(updated.price).toBe(150);
        });

        test('should update stock successfully', async () => {
            const store = await seedTestData.createStore();
            const product = await seedTestData.createProduct();
            await seedTestData.createStoreProduct(store._id, product._id, { stock: 10 });

            const updated = await StoreProductService.updateStoreProduct(
                store._id.toString(),
                product._id.toString(),
                { stock: 25 }
            );

            expect(updated.stock).toBe(25);
        });

        test('should update availability successfully', async () => {
            const store = await seedTestData.createStore();
            const product = await seedTestData.createProduct();
            await seedTestData.createStoreProduct(store._id, product._id, { isAvailable: true });

            const updated = await StoreProductService.updateStoreProduct(
                store._id.toString(),
                product._id.toString(),
                { isAvailable: false }
            );

            expect(updated.isAvailable).toBe(false);
        });

        test('should update multiple fields at once', async () => {
            const store = await seedTestData.createStore();
            const product = await seedTestData.createProduct();
            await seedTestData.createStoreProduct(store._id, product._id, {
                price: 100,
                stock: 10,
                isAvailable: true
            });

            const updated = await StoreProductService.updateStoreProduct(
                store._id.toString(),
                product._id.toString(),
                {
                    price: 200,
                    stock: 50,
                    isAvailable: false
                }
            );

            expect(updated.price).toBe(200);
            expect(updated.stock).toBe(50);
            expect(updated.isAvailable).toBe(false);
        });
    });

    describe('removeProductFromStore', () => {
        test('should throw NotFoundException when relationship does not exist', async () => {
            const store = await seedTestData.createStore();
            const product = await seedTestData.createProduct();

            await expect(
                StoreProductService.removeProductFromStore(
                    store._id.toString(),
                    product._id.toString()
                )
            ).rejects.toThrow(NotFoundException);

            await expect(
                StoreProductService.removeProductFromStore(
                    store._id.toString(),
                    product._id.toString()
                )
            ).rejects.toThrow('Store-Product relationship not found');
        });

        test('should successfully remove product from store', async () => {
            const store = await seedTestData.createStore();
            const product = await seedTestData.createProduct();
            await seedTestData.createStoreProduct(store._id, product._id);

            const deleted = await StoreProductService.removeProductFromStore(
                store._id.toString(),
                product._id.toString()
            );

            expect(deleted).toBeDefined();
            expect(deleted.storeId.toString()).toBe(store._id.toString());
            expect(deleted.productId.toString()).toBe(product._id.toString());

            // Verify it's actually deleted
            const products = await StoreProductService.getStoreProducts(store._id.toString());
            expect(products).toHaveLength(0);
        });

        test('should only remove the specific store-product relationship', async () => {
            const store1 = await seedTestData.createStore({ name: 'Store 1' });
            const store2 = await seedTestData.createStore({ name: 'Store 2' });
            const product = await seedTestData.createProduct();

            await seedTestData.createStoreProduct(store1._id, product._id);
            await seedTestData.createStoreProduct(store2._id, product._id);

            await StoreProductService.removeProductFromStore(
                store1._id.toString(),
                product._id.toString()
            );

            // Store 1 should have no products
            const store1Products = await StoreProductService.getStoreProducts(store1._id.toString());
            expect(store1Products).toHaveLength(0);

            // Store 2 should still have the product
            const store2Products = await StoreProductService.getStoreProducts(store2._id.toString());
            expect(store2Products).toHaveLength(1);
        });
    });
});
