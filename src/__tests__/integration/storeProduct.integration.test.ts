import { describe, expect, test, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express, { Express } from 'express';
import bodyParser from 'body-parser';
import storeProductsRouter from '../../store-product/StoreProduct-Router';
import { connect, closeDatabase, clearDatabase, seedTestData } from '../utils/testDb';
import { globalErrorHandling } from '../../utils/error.response';

describe('StoreProduct API Integration Tests', () => {
    let app: Express;

    // Setup test app and database
    beforeAll(async () => {
        await connect();

        app = express();
        app.use(express.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
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
        test('should return 404 when store does not exist', async () => {
            const product = await seedTestData.createProduct();
            const fakeStoreId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .post(`/api/stores/${fakeStoreId}/products`)
                .send({
                    productId: product._id.toString(),
                    price: 99.99,
                    stock: 10,
                    isAvailable: true
                });

            expect(response.status).toBe(404);
        });

        test('should return 404 when product does not exist', async () => {
            const store = await seedTestData.createStore();
            const fakeProductId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .post(`/api/stores/${store._id}/products`)
                .send({
                    productId: fakeProductId,
                    price: 99.99,
                    stock: 10,
                    isAvailable: true
                });

            expect(response.status).toBe(404);
        });

        test('should successfully add product to store', async () => {
            const store = await seedTestData.createStore({ name: 'Test Store' });
            const product = await seedTestData.createProduct({ name: 'Test Product' });

            const response = await request(app)
                .post(`/api/stores/${store._id}/products`)
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
            const store = await seedTestData.createStore();
            const product = await seedTestData.createProduct();

            const response = await request(app)
                .post(`/api/stores/${store._id}/products`)
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
        test('should return 404 when store-product relationship does not exist', async () => {
            const store = await seedTestData.createStore();
            const product = await seedTestData.createProduct();

            const response = await request(app)
                .patch(`/api/stores/${store._id}/products/${product._id}`)
                .send({ price: 199.99 });

            expect(response.status).toBe(404);
        });

        test('should update price successfully', async () => {
            const store = await seedTestData.createStore();
            const product = await seedTestData.createProduct();
            await seedTestData.createStoreProduct(store._id, product._id, { price: 100 });

            const response = await request(app)
                .patch(`/api/stores/${store._id}/products/${product._id}`)
                .send({ price: 150 });

            expect(response.status).toBe(200);
            expect(response.body.data.updatedStoreProduct.price).toBe(150);
        });

        test('should update stock successfully', async () => {
            const store = await seedTestData.createStore();
            const product = await seedTestData.createProduct();
            await seedTestData.createStoreProduct(store._id, product._id, { stock: 10 });

            const response = await request(app)
                .patch(`/api/stores/${store._id}/products/${product._id}`)
                .send({ stock: 50 });

            expect(response.status).toBe(200);
            expect(response.body.data.updatedStoreProduct.stock).toBe(50);
        });

        test('should update availability successfully', async () => {
            const store = await seedTestData.createStore();
            const product = await seedTestData.createProduct();
            await seedTestData.createStoreProduct(store._id, product._id, { isAvailable: true });

            const response = await request(app)
                .patch(`/api/stores/${store._id}/products/${product._id}`)
                .send({ isAvailable: false });

            expect(response.status).toBe(200);
            expect(response.body.data.updatedStoreProduct.isAvailable).toBe(false);
        });

        test('should update multiple fields at once', async () => {
            const store = await seedTestData.createStore();
            const product = await seedTestData.createProduct();
            await seedTestData.createStoreProduct(store._id, product._id, {
                price: 100,
                stock: 10,
                isAvailable: true
            });

            const response = await request(app)
                .patch(`/api/stores/${store._id}/products/${product._id}`)
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
        test('should return 404 when store-product relationship does not exist', async () => {
            const store = await seedTestData.createStore();
            const product = await seedTestData.createProduct();

            const response = await request(app)
                .delete(`/api/stores/${store._id}/products/${product._id}`);

            expect(response.status).toBe(404);
        });

        test('should successfully remove product from store', async () => {
            const store = await seedTestData.createStore();
            const product = await seedTestData.createProduct();
            await seedTestData.createStoreProduct(store._id, product._id);

            const response = await request(app)
                .delete(`/api/stores/${store._id}/products/${product._id}`);

            expect(response.status).toBe(200);

            // Verify it's actually deleted
            const getResponse = await request(app).get(`/api/stores/${store._id}/products`);
            expect(getResponse.body.data.storeProducts).toHaveLength(0);
        });

        test('should only remove the specific store-product relationship', async () => {
            const store1 = await seedTestData.createStore({ name: 'Store 1' });
            const store2 = await seedTestData.createStore({ name: 'Store 2' });
            const product = await seedTestData.createProduct();

            await seedTestData.createStoreProduct(store1._id, product._id);
            await seedTestData.createStoreProduct(store2._id, product._id);

            const response = await request(app)
                .delete(`/api/stores/${store1._id}/products/${product._id}`);

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
});
