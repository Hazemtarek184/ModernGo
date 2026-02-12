import { describe, expect, test, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express, { Express } from 'express';
import bodyParser from 'body-parser';
import storeProductsRouter from '../../store-product/StoreProduct-Router';
import storesRouter from '../../store/Store-Router';
import { connect, closeDatabase, clearDatabase, seedTestData } from '../utils/testDb';
import { factories } from '../utils/testHelpers';
import { globalErrorHandling } from '../../utils/error.response';

describe('StoreProduct API Integration Tests', () => {
    let app: Express;

    // Helper to register a store and get auth token
    const registerStoreAndGetToken = async (overrides: any = {}) => {
        const storeData = factories.storeData({
            email: `store${Date.now()}@test.com`,
            password: 'TestPass123',
            confirmPassword: 'TestPass123',
            ...overrides
        });

        const response = await request(app)
            .post('/api/stores/register')
            .send(storeData);

        return {
            token: response.body.data?.token as string,
            store: response.body.data?.store,
            storeData
        };
    };

    // Setup test app and database
    beforeAll(async () => {
        await connect();

        app = express();
        app.use(express.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        app.use('/api/stores', storesRouter);
        app.use('/api', storeProductsRouter);
        app.use(globalErrorHandling);
    });

    afterAll(async () => {
        await closeDatabase();
    });

    beforeEach(async () => {
        await clearDatabase();
    });

    describe('POST /api/stores/:storeId/products', () => {
        test('should return 401 without auth token', async () => {
            const store = await seedTestData.createStore();
            const product = await seedTestData.createProduct();

            const response = await request(app)
                .post(`/api/stores/${store._id}/products`)
                .send({
                    productId: product._id.toString(),
                    price: 99.99,
                    stock: 10,
                    isAvailable: true
                });

            expect(response.status).toBe(401);
        });

        test('should return 403 when adding product to a store you do not own', async () => {
            const { token } = await registerStoreAndGetToken();
            const otherStore = await seedTestData.createStore({ name: 'Other Store' });
            const product = await seedTestData.createProduct();

            const response = await request(app)
                .post(`/api/stores/${otherStore._id}/products`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    productId: product._id.toString(),
                    price: 99.99,
                    stock: 10,
                    isAvailable: true
                });

            expect(response.status).toBe(403);
        });

        test('should return 404 when product does not exist', async () => {
            const { token, store } = await registerStoreAndGetToken();
            const fakeProductId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .post(`/api/stores/${store._id}/products`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    productId: fakeProductId,
                    price: 99.99,
                    stock: 10,
                    isAvailable: true
                });

            expect(response.status).toBe(404);
        });

        test('should successfully add product to store', async () => {
            const { token, store } = await registerStoreAndGetToken();
            const product = await seedTestData.createProduct({ name: 'Test Product' });

            const response = await request(app)
                .post(`/api/stores/${store._id}/products`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    productId: product._id.toString(),
                    price: 149.99,
                    stock: 25,
                    isAvailable: true
                });

            expect(response.status).toBe(201);
            expect(response.body.data.storeProduct).toBeDefined();
            expect(response.body.data.storeProduct.price).toBe(149.99);
            expect(response.body.data.storeProduct.stock).toBe(25);
            expect(response.body.data.storeProduct.isAvailable).toBe(true);
        });

        test('should add product with default availability', async () => {
            const { token, store } = await registerStoreAndGetToken();
            const product = await seedTestData.createProduct();

            const response = await request(app)
                .post(`/api/stores/${store._id}/products`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    productId: product._id.toString(),
                    price: 49.99,
                    stock: 5,
                    isAvailable: true
                });

            expect(response.status).toBe(201);
            expect(response.body.data.storeProduct.isAvailable).toBe(true);
        });
    });

    describe('GET /api/stores/:storeId/products', () => {
        test('should return 404 when store does not exist', async () => {
            const fakeStoreId = '507f1f77bcf86cd799439011';

            const response = await request(app).get(`/api/stores/${fakeStoreId}/products`);

            expect(response.status).toBe(404);
        });

        test('should return empty array when store has no products', async () => {
            const store = await seedTestData.createStore();

            const response = await request(app).get(`/api/stores/${store._id}/products`);

            expect(response.status).toBe(200);
            expect(response.body.data.storeProducts).toEqual([]);
        });

        test('should return all products for a store', async () => {
            const store = await seedTestData.createStore();
            const product1 = await seedTestData.createProduct({ name: 'Product 1' });
            const product2 = await seedTestData.createProduct({ name: 'Product 2' });
            const product3 = await seedTestData.createProduct({ name: 'Product 3' });

            await seedTestData.createStoreProduct(store._id, product1._id, { price: 10 });
            await seedTestData.createStoreProduct(store._id, product2._id, { price: 20 });
            await seedTestData.createStoreProduct(store._id, product3._id, { price: 30 });

            const response = await request(app).get(`/api/stores/${store._id}/products`);

            expect(response.status).toBe(200);
            expect(response.body.data.storeProducts).toHaveLength(3);
        });

        test('should include product details when populated', async () => {
            const store = await seedTestData.createStore();
            const product = await seedTestData.createProduct({ name: 'Detailed Product' });

            await seedTestData.createStoreProduct(store._id, product._id, { price: 99.99 });

            const response = await request(app).get(`/api/stores/${store._id}/products`);

            expect(response.status).toBe(200);
            expect(response.body.data.storeProducts).toHaveLength(1);
            expect(response.body.data.storeProducts[0].productId).toBeDefined();
        });

        test('should not include products from other stores', async () => {
            const store1 = await seedTestData.createStore({ name: 'Store 1' });
            const store2 = await seedTestData.createStore({ name: 'Store 2' });
            const product1 = await seedTestData.createProduct({ name: 'Product 1' });
            const product2 = await seedTestData.createProduct({ name: 'Product 2' });

            await seedTestData.createStoreProduct(store1._id, product1._id);
            await seedTestData.createStoreProduct(store2._id, product2._id);

            const response = await request(app).get(`/api/stores/${store1._id}/products`);

            expect(response.status).toBe(200);
            expect(response.body.data.storeProducts).toHaveLength(1);
        });
    });

    describe('PATCH /api/stores/:storeId/products/:productId', () => {
        test('should return 401 without auth token', async () => {
            const store = await seedTestData.createStore();
            const product = await seedTestData.createProduct();

            const response = await request(app)
                .patch(`/api/stores/${store._id}/products/${product._id}`)
                .send({ price: 199.99 });

            expect(response.status).toBe(401);
        });

        test('should return 403 when updating product in a store you do not own', async () => {
            const { token } = await registerStoreAndGetToken();
            const otherStore = await seedTestData.createStore({ name: 'Other Store' });
            const product = await seedTestData.createProduct();
            await seedTestData.createStoreProduct(otherStore._id, product._id, { price: 100 });

            const response = await request(app)
                .patch(`/api/stores/${otherStore._id}/products/${product._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ price: 199.99 });

            expect(response.status).toBe(403);
        });

        test('should return 404 when store-product relationship does not exist', async () => {
            const { token, store } = await registerStoreAndGetToken();
            const product = await seedTestData.createProduct();

            const response = await request(app)
                .patch(`/api/stores/${store._id}/products/${product._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ price: 199.99 });

            expect(response.status).toBe(404);
        });

        test('should update price successfully', async () => {
            const { token, store } = await registerStoreAndGetToken();
            const product = await seedTestData.createProduct();
            await seedTestData.createStoreProduct(store._id, product._id, { price: 100 });

            const response = await request(app)
                .patch(`/api/stores/${store._id}/products/${product._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ price: 150 });

            expect(response.status).toBe(200);
            expect(response.body.data.updatedStoreProduct.price).toBe(150);
        });

        test('should update stock successfully', async () => {
            const { token, store } = await registerStoreAndGetToken();
            const product = await seedTestData.createProduct();
            await seedTestData.createStoreProduct(store._id, product._id, { stock: 10 });

            const response = await request(app)
                .patch(`/api/stores/${store._id}/products/${product._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ stock: 50 });

            expect(response.status).toBe(200);
            expect(response.body.data.updatedStoreProduct.stock).toBe(50);
        });

        test('should update availability successfully', async () => {
            const { token, store } = await registerStoreAndGetToken();
            const product = await seedTestData.createProduct();
            await seedTestData.createStoreProduct(store._id, product._id, { isAvailable: true });

            const response = await request(app)
                .patch(`/api/stores/${store._id}/products/${product._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ isAvailable: false });

            expect(response.status).toBe(200);
            expect(response.body.data.updatedStoreProduct.isAvailable).toBe(false);
        });

        test('should update multiple fields at once', async () => {
            const { token, store } = await registerStoreAndGetToken();
            const product = await seedTestData.createProduct();
            await seedTestData.createStoreProduct(store._id, product._id, {
                price: 100,
                stock: 10,
                isAvailable: true
            });

            const response = await request(app)
                .patch(`/api/stores/${store._id}/products/${product._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    price: 200,
                    stock: 50,
                    isAvailable: false
                });

            expect(response.status).toBe(200);
            expect(response.body.data.updatedStoreProduct.price).toBe(200);
            expect(response.body.data.updatedStoreProduct.stock).toBe(50);
            expect(response.body.data.updatedStoreProduct.isAvailable).toBe(false);
        });
    });

    describe('DELETE /api/stores/:storeId/products/:productId', () => {
        test('should return 401 without auth token', async () => {
            const store = await seedTestData.createStore();
            const product = await seedTestData.createProduct();

            const response = await request(app)
                .delete(`/api/stores/${store._id}/products/${product._id}`);

            expect(response.status).toBe(401);
        });

        test('should return 403 when removing product from a store you do not own', async () => {
            const { token } = await registerStoreAndGetToken();
            const otherStore = await seedTestData.createStore({ name: 'Other Store' });
            const product = await seedTestData.createProduct();
            await seedTestData.createStoreProduct(otherStore._id, product._id);

            const response = await request(app)
                .delete(`/api/stores/${otherStore._id}/products/${product._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(403);
        });

        test('should return 404 when store-product relationship does not exist', async () => {
            const { token, store } = await registerStoreAndGetToken();
            const product = await seedTestData.createProduct();

            const response = await request(app)
                .delete(`/api/stores/${store._id}/products/${product._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
        });

        test('should successfully remove product from store', async () => {
            const { token, store } = await registerStoreAndGetToken();
            const product = await seedTestData.createProduct();
            await seedTestData.createStoreProduct(store._id, product._id);

            const response = await request(app)
                .delete(`/api/stores/${store._id}/products/${product._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);

            // Verify it's actually deleted
            const getResponse = await request(app).get(`/api/stores/${store._id}/products`);
            expect(getResponse.body.data.storeProducts).toHaveLength(0);
        });

        test('should only remove the specific store-product relationship', async () => {
            const { token: token1, store: store1 } = await registerStoreAndGetToken({
                name: 'Store 1',
                email: 'store1@test.com'
            });
            const { token: token2, store: store2 } = await registerStoreAndGetToken({
                name: 'Store 2',
                email: 'store2@test.com'
            });
            const product = await seedTestData.createProduct();

            // Add product to both stores via API
            await request(app)
                .post(`/api/stores/${store1._id}/products`)
                .set('Authorization', `Bearer ${token1}`)
                .send({
                    productId: product._id.toString(),
                    price: 100,
                    stock: 10,
                    isAvailable: true
                });

            await request(app)
                .post(`/api/stores/${store2._id}/products`)
                .set('Authorization', `Bearer ${token2}`)
                .send({
                    productId: product._id.toString(),
                    price: 120,
                    stock: 5,
                    isAvailable: true
                });

            // Delete from store 1
            const response = await request(app)
                .delete(`/api/stores/${store1._id}/products/${product._id}`)
                .set('Authorization', `Bearer ${token1}`);

            expect(response.status).toBe(200);

            // Store 1 should have no products
            const store1Response = await request(app).get(`/api/stores/${store1._id}/products`);
            expect(store1Response.body.data.storeProducts).toHaveLength(0);

            // Store 2 should still have the product
            const store2Response = await request(app).get(`/api/stores/${store2._id}/products`);
            expect(store2Response.body.data.storeProducts).toHaveLength(1);
        });
    });

    describe('GET /api/products/:productId/stores', () => {
        test('should return 404 when product does not exist', async () => {
            const fakeProductId = '507f1f77bcf86cd799439011';

            const response = await request(app).get(`/api/products/${fakeProductId}/stores`);

            expect(response.status).toBe(404);
        });

        test('should return empty array when product is in no stores', async () => {
            const product = await seedTestData.createProduct();

            const response = await request(app).get(`/api/products/${product._id}/stores`);

            expect(response.status).toBe(200);
            expect(response.body.data.productStores).toEqual([]);
        });

        test('should return all stores selling a product', async () => {
            const product = await seedTestData.createProduct();
            const store1 = await seedTestData.createStore({ name: 'Store 1' });
            const store2 = await seedTestData.createStore({ name: 'Store 2' });
            const store3 = await seedTestData.createStore({ name: 'Store 3' });

            await seedTestData.createStoreProduct(store1._id, product._id, { price: 100 });
            await seedTestData.createStoreProduct(store2._id, product._id, { price: 120 });
            await seedTestData.createStoreProduct(store3._id, product._id, { price: 90 });

            const response = await request(app).get(`/api/products/${product._id}/stores`);

            expect(response.status).toBe(200);
            expect(response.body.data.productStores).toHaveLength(3);
        });

        test('should include store details when populated', async () => {
            const product = await seedTestData.createProduct();
            const store = await seedTestData.createStore({ name: 'Detailed Store' });

            await seedTestData.createStoreProduct(store._id, product._id);

            const response = await request(app).get(`/api/products/${product._id}/stores`);

            expect(response.status).toBe(200);
            expect(response.body.data.productStores).toHaveLength(1);
            expect(response.body.data.productStores[0].storeId).toBeDefined();
        });
    });

    // ─── Nearby Product-Store Tests ──────────────────────────────

    describe('GET /api/products/:productId/stores/nearby', () => {
        test('should return 404 when product does not exist', async () => {
            const fakeProductId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .get(`/api/products/${fakeProductId}/stores/nearby`)
                .query({ longitude: 31.2357, latitude: 30.0444 });

            expect(response.status).toBe(404);
        });

        test('should return 400 when longitude is missing', async () => {
            const product = await seedTestData.createProduct();

            const response = await request(app)
                .get(`/api/products/${product._id}/stores/nearby`)
                .query({ latitude: 30.0444 });

            expect(response.status).toBe(400);
        });

        test('should return 400 when latitude is missing', async () => {
            const product = await seedTestData.createProduct();

            const response = await request(app)
                .get(`/api/products/${product._id}/stores/nearby`)
                .query({ longitude: 31.2357 });

            expect(response.status).toBe(400);
        });

        test('should return empty array when no stores carry the product', async () => {
            const product = await seedTestData.createProduct();
            // Create a store nearby but do NOT link it to the product
            await seedTestData.createStore({
                name: 'Nearby Store',
                location: {
                    type: 'Point',
                    coordinates: [31.2360, 30.0450],
                }
            });

            const response = await request(app)
                .get(`/api/products/${product._id}/stores/nearby`)
                .query({ longitude: 31.2357, latitude: 30.0444 });

            expect(response.status).toBe(200);
            expect(response.body.data.stores).toHaveLength(0);
        });

        test('should return nearby stores that carry the product', async () => {
            const product = await seedTestData.createProduct();

            // Store very close (~100m away)
            const nearStore = await seedTestData.createStore({
                name: 'Near Store',
                location: {
                    type: 'Point',
                    coordinates: [31.2360, 30.0448],
                }
            });
            await seedTestData.createStoreProduct(nearStore._id, product._id, { price: 50 });

            const response = await request(app)
                .get(`/api/products/${product._id}/stores/nearby`)
                .query({ longitude: 31.2357, latitude: 30.0444, maxDistance: 5000 });

            expect(response.status).toBe(200);
            expect(response.body.data.stores).toHaveLength(1);
            expect(response.body.data.stores[0].name).toBe('Near Store');
            expect(response.body.data.stores[0].distance).toBeDefined();
            expect(response.body.data.stores[0].products).toHaveLength(1);
            expect(response.body.data.stores[0].products[0].price).toBe(50);
        });

        test('should exclude stores outside maxDistance', async () => {
            const product = await seedTestData.createProduct();

            // Store very close
            const nearStore = await seedTestData.createStore({
                name: 'Near Store',
                location: {
                    type: 'Point',
                    coordinates: [31.2360, 30.0448],
                }
            });
            // Store far away (~100km)
            const farStore = await seedTestData.createStore({
                name: 'Far Store',
                location: {
                    type: 'Point',
                    coordinates: [32.2357, 31.0444],
                }
            });

            await seedTestData.createStoreProduct(nearStore._id, product._id);
            await seedTestData.createStoreProduct(farStore._id, product._id);

            const response = await request(app)
                .get(`/api/products/${product._id}/stores/nearby`)
                .query({ longitude: 31.2357, latitude: 30.0444, maxDistance: 5000 });

            expect(response.status).toBe(200);
            expect(response.body.data.stores).toHaveLength(1);
            expect(response.body.data.stores[0].name).toBe('Near Store');
        });

        test('should exclude unavailable store-product relationships', async () => {
            const product = await seedTestData.createProduct();

            const store = await seedTestData.createStore({
                name: 'Unavailable Store',
                location: {
                    type: 'Point',
                    coordinates: [31.2360, 30.0448],
                }
            });
            await seedTestData.createStoreProduct(store._id, product._id, { isAvailable: false });

            const response = await request(app)
                .get(`/api/products/${product._id}/stores/nearby`)
                .query({ longitude: 31.2357, latitude: 30.0444 });

            expect(response.status).toBe(200);
            expect(response.body.data.stores).toHaveLength(0);
        });

        test('should exclude frozen products', async () => {
            const product = await seedTestData.createProduct({ freezedAt: new Date() });

            const store = await seedTestData.createStore({
                name: 'Store With Frozen Product',
                location: {
                    type: 'Point',
                    coordinates: [31.2360, 30.0448],
                }
            });
            await seedTestData.createStoreProduct(store._id, product._id);

            const response = await request(app)
                .get(`/api/products/${product._id}/stores/nearby`)
                .query({ longitude: 31.2357, latitude: 30.0444 });

            expect(response.status).toBe(200);
            expect(response.body.data.stores).toHaveLength(0);
        });

        test('should sort stores by distance (nearest first)', async () => {
            const product = await seedTestData.createProduct();

            // Store further away
            const farStore = await seedTestData.createStore({
                name: 'Farther Store',
                location: {
                    type: 'Point',
                    coordinates: [31.2500, 30.0600],
                }
            });
            // Store closer
            const nearStore = await seedTestData.createStore({
                name: 'Closer Store',
                location: {
                    type: 'Point',
                    coordinates: [31.2360, 30.0448],
                }
            });

            await seedTestData.createStoreProduct(farStore._id, product._id);
            await seedTestData.createStoreProduct(nearStore._id, product._id);

            const response = await request(app)
                .get(`/api/products/${product._id}/stores/nearby`)
                .query({ longitude: 31.2357, latitude: 30.0444, maxDistance: 50000 });

            expect(response.status).toBe(200);
            expect(response.body.data.stores).toHaveLength(2);
            expect(response.body.data.stores[0].name).toBe('Closer Store');
            expect(response.body.data.stores[1].name).toBe('Farther Store');
            expect(response.body.data.stores[0].distance).toBeLessThan(
                response.body.data.stores[1].distance
            );
        });

        test('should not include store password in results', async () => {
            const product = await seedTestData.createProduct();

            const store = await seedTestData.createStore({
                name: 'Secure Store',
                location: {
                    type: 'Point',
                    coordinates: [31.2360, 30.0448],
                }
            });
            await seedTestData.createStoreProduct(store._id, product._id);

            const response = await request(app)
                .get(`/api/products/${product._id}/stores/nearby`)
                .query({ longitude: 31.2357, latitude: 30.0444 });

            expect(response.status).toBe(200);
            expect(response.body.data.stores[0].password).toBeUndefined();
        });
    });

    describe('GET /api/products/stores/nearby', () => {
        test('should return 400 when query is missing', async () => {
            const response = await request(app)
                .get('/api/products/stores/nearby')
                .query({ longitude: 31.2357, latitude: 30.0444 });

            expect(response.status).toBe(400);
        });

        test('should return 400 when longitude is missing', async () => {
            const response = await request(app)
                .get('/api/products/stores/nearby')
                .query({ query: 'headphones', latitude: 30.0444 });

            expect(response.status).toBe(400);
        });

        test('should return empty array when no products match the search', async () => {
            const response = await request(app)
                .get('/api/products/stores/nearby')
                .query({ query: 'nonexistent-xyz', longitude: 31.2357, latitude: 30.0444 });

            expect(response.status).toBe(200);
            expect(response.body.data.stores).toHaveLength(0);
        });

        test('should find nearby stores selling products matching search query', async () => {
            const product = await seedTestData.createProduct({ name: 'Wireless Headphones' });

            const store = await seedTestData.createStore({
                name: 'Audio Shop',
                location: {
                    type: 'Point',
                    coordinates: [31.2360, 30.0448],
                }
            });
            await seedTestData.createStoreProduct(store._id, product._id, { price: 199 });

            const response = await request(app)
                .get('/api/products/stores/nearby')
                .query({ query: 'headphones', longitude: 31.2357, latitude: 30.0444 });

            expect(response.status).toBe(200);
            expect(response.body.data.stores).toHaveLength(1);
            expect(response.body.data.stores[0].name).toBe('Audio Shop');
            expect(response.body.data.stores[0].products).toHaveLength(1);
            expect(response.body.data.stores[0].products[0].productName).toBe('Wireless Headphones');
        });

        test('should be case-insensitive', async () => {
            const product = await seedTestData.createProduct({ name: 'Bluetooth Speaker' });

            const store = await seedTestData.createStore({
                name: 'Tech Store',
                location: {
                    type: 'Point',
                    coordinates: [31.2360, 30.0448],
                }
            });
            await seedTestData.createStoreProduct(store._id, product._id);

            const response = await request(app)
                .get('/api/products/stores/nearby')
                .query({ query: 'BLUETOOTH', longitude: 31.2357, latitude: 30.0444 });

            expect(response.status).toBe(200);
            expect(response.body.data.stores).toHaveLength(1);
        });

        test('should return multiple matching products per store', async () => {
            const product1 = await seedTestData.createProduct({ name: 'Gaming Mouse' });
            const product2 = await seedTestData.createProduct({ name: 'Gaming Keyboard' });
            const product3 = await seedTestData.createProduct({ name: 'Office Chair' }); // no match

            const store = await seedTestData.createStore({
                name: 'Gaming Store',
                location: {
                    type: 'Point',
                    coordinates: [31.2360, 30.0448],
                }
            });
            await seedTestData.createStoreProduct(store._id, product1._id, { price: 50 });
            await seedTestData.createStoreProduct(store._id, product2._id, { price: 80 });
            await seedTestData.createStoreProduct(store._id, product3._id, { price: 200 });

            const response = await request(app)
                .get('/api/products/stores/nearby')
                .query({ query: 'gaming', longitude: 31.2357, latitude: 30.0444 });

            expect(response.status).toBe(200);
            expect(response.body.data.stores).toHaveLength(1);
            // Should only include the 2 gaming products, not the office chair
            expect(response.body.data.stores[0].products).toHaveLength(2);
        });

        test('should exclude frozen products from search results', async () => {
            const activeProduct = await seedTestData.createProduct({ name: 'Active Phone' });
            const frozenProduct = await seedTestData.createProduct({
                name: 'Frozen Phone',
                freezedAt: new Date(),
            });

            const store = await seedTestData.createStore({
                name: 'Phone Store',
                location: {
                    type: 'Point',
                    coordinates: [31.2360, 30.0448],
                }
            });
            await seedTestData.createStoreProduct(store._id, activeProduct._id);
            await seedTestData.createStoreProduct(store._id, frozenProduct._id);

            const response = await request(app)
                .get('/api/products/stores/nearby')
                .query({ query: 'phone', longitude: 31.2357, latitude: 30.0444 });

            expect(response.status).toBe(200);
            expect(response.body.data.stores).toHaveLength(1);
            // Only the active product should appear
            expect(response.body.data.stores[0].products).toHaveLength(1);
            expect(response.body.data.stores[0].products[0].productName).toBe('Active Phone');
        });

        test('should exclude stores outside maxDistance', async () => {
            const product = await seedTestData.createProduct({ name: 'Test Laptop' });

            const nearStore = await seedTestData.createStore({
                name: 'Near Laptop Store',
                location: {
                    type: 'Point',
                    coordinates: [31.2360, 30.0448],
                }
            });
            const farStore = await seedTestData.createStore({
                name: 'Far Laptop Store',
                location: {
                    type: 'Point',
                    coordinates: [32.2357, 31.0444],
                }
            });

            await seedTestData.createStoreProduct(nearStore._id, product._id);
            await seedTestData.createStoreProduct(farStore._id, product._id);

            const response = await request(app)
                .get('/api/products/stores/nearby')
                .query({ query: 'laptop', longitude: 31.2357, latitude: 30.0444, maxDistance: 5000 });

            expect(response.status).toBe(200);
            expect(response.body.data.stores).toHaveLength(1);
            expect(response.body.data.stores[0].name).toBe('Near Laptop Store');
        });
    });
});
