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
        app.use(globalErrorHandling);
    });

    afterAll(async () => {
        await closeDatabase();
    });

    beforeEach(async () => {
        await clearDatabase();
    });

    // ─── Auth Endpoint Tests ────────────────────────────────────

    describe('POST /api/stores/register', () => {
        test('should register a new store', async () => {
            const storeData = factories.storeData({
                email: 'newstore@test.com',
                password: 'TestPass123',
                confirmPassword: 'TestPass123',
            });

            const response = await request(app)
                .post('/api/stores/register')
                .send(storeData);

            expect(response.status).toBe(201);
            expect(response.body.data).toHaveProperty('store');
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data.store.name).toBe(storeData.name);
            expect(response.body.data.store.email).toBe('newstore@test.com');
            expect(response.body.data.store).not.toHaveProperty('password');
        });

        test('should return 400 for duplicate email', async () => {
            const storeData = factories.storeData({
                email: 'dup@test.com',
                password: 'TestPass123',
                confirmPassword: 'TestPass123',
            });

            await request(app).post('/api/stores/register').send(storeData);

            const response = await request(app)
                .post('/api/stores/register')
                .send({
                    ...factories.storeData({
                        email: 'dup@test.com',
                        password: 'TestPass123',
                        confirmPassword: 'TestPass123',
                    }),
                    name: 'Another Store'
                });

            expect(response.status).toBe(400);
        });

        test('should return 400 for password mismatch', async () => {
            const storeData = factories.storeData({
                email: 'mismatch@test.com',
                password: 'TestPass123',
                confirmPassword: 'DifferentPass123',
            });

            const response = await request(app)
                .post('/api/stores/register')
                .send(storeData);

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/stores/login', () => {
        test('should login with valid credentials', async () => {
            // Register first
            await request(app)
                .post('/api/stores/register')
                .send(factories.storeData({
                    email: 'login@test.com',
                    password: 'TestPass123',
                    confirmPassword: 'TestPass123',
                }));

            // Login
            const response = await request(app)
                .post('/api/stores/login')
                .send({
                    email: 'login@test.com',
                    password: 'TestPass123'
                });

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty('store');
            expect(response.body.data).toHaveProperty('token');
        });

        test('should return 400 for invalid credentials', async () => {
            const response = await request(app)
                .post('/api/stores/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'TestPass123'
                });

            expect(response.status).toBe(400);
        });
    });

    // ─── Public Read Endpoint Tests ─────────────────────────────

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

    // ─── Protected Write Endpoint Tests ─────────────────────────

    describe('PUT /api/stores/:storeId', () => {
        test('should return 401 without auth token', async () => {
            const store = await seedTestData.createStore();

            const response = await request(app)
                .put(`/api/stores/${store._id}`)
                .send({ name: 'Updated Name' });

            expect(response.status).toBe(401);
        });

        test('should update store name with auth token', async () => {
            const { token, store } = await registerStoreAndGetToken();

            const response = await request(app)
                .put(`/api/stores/${store._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Updated Name' });

            expect(response.status).toBe(200);
            expect(response.body.data.store.name).toBe('Updated Name');
        });

        test('should return 403 when updating a store you do not own', async () => {
            const { token } = await registerStoreAndGetToken();
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .put(`/api/stores/${fakeId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Updated Name' });

            expect(response.status).toBe(403);
        });

        test('should update multiple fields', async () => {
            const { token, store } = await registerStoreAndGetToken();

            const response = await request(app)
                .put(`/api/stores/${store._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'New Name',
                    phone: '+201522222222'
                });

            expect(response.status).toBe(200);
            expect(response.body.data.store.name).toBe('New Name');
            expect(response.body.data.store.phone).toBe('+201522222222');
        });
    });

    describe('DELETE /api/stores/:storeId', () => {
        test('should return 401 without auth token', async () => {
            const store = await seedTestData.createStore();

            const response = await request(app).delete(`/api/stores/${store._id}`);

            expect(response.status).toBe(401);
        });

        test('should delete existing store with auth token', async () => {
            const { token, store } = await registerStoreAndGetToken();

            const response = await request(app)
                .delete(`/api/stores/${store._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);

            // Verify it's actually deleted
            const getResponse = await request(app).get(`/api/stores/${store._id}`);
            expect(getResponse.status).toBe(404);
        });

        test('should return 403 when deleting a store you do not own', async () => {
            const { token } = await registerStoreAndGetToken();
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .delete(`/api/stores/${fakeId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(403);
        });
    });

    // ─── Query Endpoint Tests ───────────────────────────────────

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

    // ─── Password Update Tests ──────────────────────────────────

    describe('PATCH /api/stores/:storeId/password', () => {
        test('should return 401 without auth token', async () => {
            const store = await seedTestData.createStore();

            const response = await request(app)
                .patch(`/api/stores/${store._id}/password`)
                .send({
                    currentPassword: 'TestPass123',
                    newPassword: 'NewPass456',
                    confirmPassword: 'NewPass456'
                });

            expect(response.status).toBe(401);
        });

        test('should update password with valid current password', async () => {
            const { token, store } = await registerStoreAndGetToken();

            const response = await request(app)
                .patch(`/api/stores/${store._id}/password`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    currentPassword: 'TestPass123',
                    newPassword: 'NewPass456',
                    confirmPassword: 'NewPass456'
                });

            expect(response.status).toBe(200);

            // Verify can login with new password
            const loginResponse = await request(app)
                .post('/api/stores/login')
                .send({
                    email: store.email,
                    password: 'NewPass456'
                });

            expect(loginResponse.status).toBe(200);
        });

        test('should return 400 for wrong current password', async () => {
            const { token, store } = await registerStoreAndGetToken();

            const response = await request(app)
                .patch(`/api/stores/${store._id}/password`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    currentPassword: 'WrongPass999',
                    newPassword: 'NewPass456',
                    confirmPassword: 'NewPass456'
                });

            expect(response.status).toBe(400);
        });
    });
});
