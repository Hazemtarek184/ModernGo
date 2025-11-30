import { describe, expect, test, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express, { Express } from 'express';
import bodyParser from 'body-parser';
import storesRouter from '../../store/Store-Router';
import { connect, closeDatabase, clearDatabase, seedTestData } from '../utils/testDb';
import { factories } from '../utils/testHelpers';
import { globalErrorHandling } from '../../utils/error.response';

describe('Store API Integration Tests', () => {
    let app: Express;

    // Setup test app and database
    beforeAll(async () => {
        await connect();

        app = express();
        app.use(express.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        app.use('/api/stores', storesRouter);
        app.use(globalErrorHandling);
    });

    afterAll(async () => {
        await closeDatabase();
    });

    beforeEach(async () => {
        await clearDatabase();
    });

    describe('GET /api/stores', () => {
        test('should return empty array when no stores exist', async () => {
            const response = await request(app).get('/api/stores');

            expect(response.status).toBe(200);
            expect(response.body.data.stores).toEqual([]);
        });

        test('should return all stores', async () => {
            await seedTestData.createStore({ name: 'Store 1' });
            await seedTestData.createStore({ name: 'Store 2' });
            await seedTestData.createStore({ name: 'Store 3' });

            const response = await request(app).get('/api/stores');

            expect(response.status).toBe(200);
            expect(response.body.data.stores).toHaveLength(3);
            expect(response.body.data.stores[0].name).toBe('Store 1');
        });
    });

    describe('POST /api/stores', () => {
        test('should create a new store with valid data', async () => {
            const storeData = factories.storeData({ name: 'New Store' });

            const response = await request(app)
                .post('/api/stores')
                .send(storeData);

            expect(response.status).toBe(201);
            expect(response.body.data.store).toHaveProperty('_id');
            expect(response.body.data.store.name).toBe('New Store');
            expect(response.body.data.store.address).toBe(storeData.address);
            expect(response.body.data.store.phone).toBe(storeData.phone);
        });

        test('should create store with location', async () => {
            const storeData = factories.storeData({
                name: 'Location Store',
                location: {
                    type: 'Point',
                    coordinates: [31.2357, 30.0444]
                }
            });

            const response = await request(app)
                .post('/api/stores')
                .send(storeData);

            expect(response.status).toBe(201);
            expect(response.body.data.store.location.type).toBe('Point');
            expect(response.body.data.store.location.coordinates).toEqual([31.2357, 30.0444]);
        });

        test('should create store with categories', async () => {
            const storeData = factories.storeData({
                categories: ['electronics', 'gadgets', 'tech']
            });

            const response = await request(app)
                .post('/api/stores')
                .send(storeData);

            expect(response.status).toBe(201);
            expect(response.body.data.store.categories).toEqual(['electronics', 'gadgets', 'tech']);
        });
    });

    describe('GET /api/stores/:storeId', () => {
        test('should return 404 when store does not exist', async () => {
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app).get(`/api/stores/${fakeId}`);

            expect(response.status).toBe(404);
        });

        test('should return store when it exists', async () => {
            const store = await seedTestData.createStore({ name: 'Test Store' });

            const response = await request(app).get(`/api/stores/${store._id}`);

            expect(response.status).toBe(200);
            expect(response.body.data.store.name).toBe('Test Store');
            expect(response.body.data.store._id).toBe(store._id.toString());
        });
    });

    describe('PUT /api/stores/:storeId', () => {
        test('should return 404 when updating non-existent store', async () => {
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .put(`/api/stores/${fakeId}`)
                .send({ name: 'Updated Name' });

            expect(response.status).toBe(404);
        });

        test('should update store name', async () => {
            const store = await seedTestData.createStore({ name: 'Original Name' });

            const response = await request(app)
                .put(`/api/stores/${store._id}`)
                .send({ name: 'Updated Name' });

            expect(response.status).toBe(200);
            expect(response.body.data.store.name).toBe('Updated Name');
        });

        test('should update store phone', async () => {
            const store = await seedTestData.createStore({ phone: '+201111111111' });

            const response = await request(app)
                .put(`/api/stores/${store._id}`)
                .send({ phone: '+202222222222' });

            expect(response.status).toBe(200);
            expect(response.body.data.store.phone).toBe('+202222222222');
        });

        test('should update multiple fields', async () => {
            const store = await seedTestData.createStore({
                name: 'Old Name',
                phone: '+201111111111'
            });

            const response = await request(app)
                .put(`/api/stores/${store._id}`)
                .send({
                    name: 'New Name',
                    phone: '+202222222222'
                });

            expect(response.status).toBe(200);
            expect(response.body.data.store.name).toBe('New Name');
            expect(response.body.data.store.phone).toBe('+202222222222');
        });
    });

    describe('DELETE /api/stores/:storeId', () => {
        test('should return 404 when deleting non-existent store', async () => {
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app).delete(`/api/stores/${fakeId}`);

            expect(response.status).toBe(404);
        });

        test('should delete existing store', async () => {
            const store = await seedTestData.createStore({ name: 'To Delete' });

            const response = await request(app).delete(`/api/stores/${store._id}`);

            expect(response.status).toBe(200);

            // Verify it's actually deleted
            const getResponse = await request(app).get(`/api/stores/${store._id}`);
            expect(getResponse.status).toBe(404);
        });
    });

    describe('GET /api/stores/search', () => {
        test('should return empty array when no stores match', async () => {
            await seedTestData.createStore({ name: 'Electronics Store' });

            const response = await request(app)
                .get('/api/stores/search')
                .query({ query: 'Food' });

            expect(response.status).toBe(200);
            expect(response.body.data.stores).toHaveLength(0);
        });

        test('should find stores matching search query', async () => {
            await seedTestData.createStore({ name: 'Best Electronics' });
            await seedTestData.createStore({ name: 'Super Electronics' });
            await seedTestData.createStore({ name: 'Food Market' });

            const response = await request(app)
                .get('/api/stores/search')
                .query({ query: 'electronics' });

            expect(response.status).toBe(200);
            expect(response.body.data.stores).toHaveLength(2);
        });

        test('should be case insensitive', async () => {
            await seedTestData.createStore({ name: 'TECH STORE' });

            const response = await request(app)
                .get('/api/stores/search')
                .query({ query: 'tech store' });

            expect(response.status).toBe(200);
            expect(response.body.data.stores).toHaveLength(1);
        });
    });

    describe('GET /api/stores/category/:category', () => {
        test('should return empty array when no stores have the category', async () => {
            await seedTestData.createStore({ categories: ['electronics'] });

            const response = await request(app).get('/api/stores/category/food');

            expect(response.status).toBe(200);
            expect(response.body.data.stores).toHaveLength(0);
        });

        test('should find stores with specified category', async () => {
            await seedTestData.createStore({ categories: ['electronics', 'gadgets'] });
            await seedTestData.createStore({ categories: ['electronics'] });
            await seedTestData.createStore({ categories: ['food'] });

            const response = await request(app).get('/api/stores/category/electronics');

            expect(response.status).toBe(200);
            expect(response.body.data.stores).toHaveLength(2);
        });
    });

    describe('GET /api/stores/nearby', () => {
        test('should require longitude and latitude parameters', async () => {
            const response = await request(app).get('/api/stores/nearby');

            expect(response.status).toBe(400);
        });

        test('should find nearby stores', async () => {
            // Create stores with specific coordinates
            await seedTestData.createStore({
                name: 'Nearby Store',
                location: {
                    type: 'Point',
                    coordinates: [31.2357, 30.0444] // Cairo
                }
            });

            const response = await request(app)
                .get('/api/stores/nearby')
                .query({
                    longitude: 31.2357,
                    latitude: 30.0444,
                    maxDistance: 5000 // 5km radius
                });

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.data.stores)).toBe(true);
        });
    });
});
