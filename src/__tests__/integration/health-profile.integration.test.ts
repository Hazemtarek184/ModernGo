import { describe, expect, test, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express, { Express } from 'express';
import bodyParser from 'body-parser';
import healthProfileRouter from '../../health-profile/HealthProfile-Router';
import customersRouter from '../../customer/Customer-Router';
import { connect, closeDatabase, clearDatabase } from '../utils/testDb';
import { globalErrorHandling } from '../../utils/error.response';

describe('Health Profile Integration Tests', () => {
    let app: Express;

    // Helper to register a customer and get auth token
    const registerCustomerAndGetToken = async () => {
        const dummyImageBuffer = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            'base64'
        );
        const req = request(app).post('/api/customers/register');
        req.field('firstName', 'Test');
        req.field('lastName', 'Customer');
        req.field('email', `customer${Date.now()}@test.com`);
        req.field('phone', `+2010${Math.floor(10000000 + Math.random() * 90000000)}`);
        req.field('password', 'TestPass123!');
        req.field('confirmPassword', 'TestPass123!');
        req.attach('profilePhoto', dummyImageBuffer, { filename: 'test.png', contentType: 'image/png' });
        
        const response = await req;
        return {
            token: response.body.data?.token as string,
            customer: response.body.data?.customer
        };
    };

    beforeAll(async () => {
        await connect();

        app = express();
        app.use(express.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        
        // We need both customers (for auth) and health-profiles routes
        app.use('/api/customers', customersRouter);
        app.use('/api/health-profiles', healthProfileRouter);
        app.use(globalErrorHandling);
    });

    afterAll(async () => {
        await closeDatabase();
    });

    beforeEach(async () => {
        await clearDatabase();
    });

    describe('POST /api/health-profiles', () => {
        test('should create a health profile for an authenticated customer', async () => {
            const { token } = await registerCustomerAndGetToken();

            const response = await request(app)
                .post('/api/health-profiles')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    weight: 70.5,
                    allergies: ['Peanuts', 'Dairy'],
                    medications: ['Aspirin'],
                    conditions: ['Asthma'],
                    dietaryRestrictions: 'Vegan'
                });

            expect(response.status).toBe(201);
            expect(response.body.data).toHaveProperty('profile');
            expect(response.body.data.profile.weight).toBe(70.5);
            expect(response.body.data.profile.allergies).toContain('Peanuts');
        });

        test('should return 401 without auth token', async () => {
            const response = await request(app)
                .post('/api/health-profiles')
                .send({
                    weight: 70.5
                });

            expect(response.status).toBe(401);
        });

        test('should return 400 when profile already exists', async () => {
            const { token } = await registerCustomerAndGetToken();

            // First creation
            await request(app)
                .post('/api/health-profiles')
                .set('Authorization', `Bearer ${token}`)
                .send({ weight: 70.5 });

            // Second creation attempt
            const response = await request(app)
                .post('/api/health-profiles')
                .set('Authorization', `Bearer ${token}`)
                .send({ weight: 75.0 });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/health-profiles/me', () => {
        test('should return health profile for authenticated customer', async () => {
            const { token } = await registerCustomerAndGetToken();

            // Create profile first
            await request(app)
                .post('/api/health-profiles')
                .set('Authorization', `Bearer ${token}`)
                .send({ weight: 80.0 });

            const response = await request(app)
                .get('/api/health-profiles/me')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty('profile');
            expect(response.body.data.profile.weight).toBe(80.0);
        });

        test('should return 400 when profile does not exist', async () => {
            const { token } = await registerCustomerAndGetToken();

            const response = await request(app)
                .get('/api/health-profiles/me')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(400);
        });
    });

    describe('PATCH /api/health-profiles/me', () => {
        test('should update existing health profile', async () => {
            const { token } = await registerCustomerAndGetToken();

            // Create profile first
            await request(app)
                .post('/api/health-profiles')
                .set('Authorization', `Bearer ${token}`)
                .send({ weight: 80.0, allergies: ['None'] });

            const response = await request(app)
                .patch('/api/health-profiles/me')
                .set('Authorization', `Bearer ${token}`)
                .send({ weight: 78.5, dietaryRestrictions: 'Keto' });

            expect(response.status).toBe(200);
            expect(response.body.data.profile.weight).toBe(78.5);
            expect(response.body.data.profile.dietaryRestrictions).toBe('Keto');
            expect(response.body.data.profile.allergies).toContain('None'); // Ensure it didn't overwrite everything blindly if it was properly patched
        });
    });

    describe('DELETE /api/health-profiles/me', () => {
        test('should delete existing health profile', async () => {
            const { token } = await registerCustomerAndGetToken();

            // Create profile first
            await request(app)
                .post('/api/health-profiles')
                .set('Authorization', `Bearer ${token}`)
                .send({ weight: 80.0 });

            const response = await request(app)
                .delete('/api/health-profiles/me')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);

            // Verify deletion
            const getResponse = await request(app)
                .get('/api/health-profiles/me')
                .set('Authorization', `Bearer ${token}`);
            
            expect(getResponse.status).toBe(400); // Profile not found
        });
    });
});
