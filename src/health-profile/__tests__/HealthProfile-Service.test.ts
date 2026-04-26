import { describe, expect, test, beforeAll, afterAll, beforeEach } from '@jest/globals';
import HealthProfileService from '../HealthProfile-Service';
import { connect, closeDatabase, clearDatabase } from '../../__tests__/utils/testDb';
import { BadRequestException } from '../../utils/error.response';
import mongoose from 'mongoose';

describe('HealthProfile Service Unit Tests', () => {
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

    const generateFakeCustomerId = () => new mongoose.Types.ObjectId().toString();

    describe('create', () => {
        test('should successfully create a health profile', async () => {
            const customerId = generateFakeCustomerId();
            const profileData = {
                weight: 75.5,
                allergies: ['Dust'],
                dietaryRestrictions: 'None'
            };

            const profile = await HealthProfileService.create(customerId, profileData);

            expect(profile).toBeDefined();
            expect(profile.customerId.toString()).toBe(customerId);
            expect(profile.weight).toBe(75.5);
            expect(profile.allergies).toContain('Dust');
            expect(profile.dietaryRestrictions).toBe('None');
            expect(profile.lastUpdated).toBeDefined();
        });

        test('should throw BadRequestException when profile already exists', async () => {
            const customerId = generateFakeCustomerId();
            
            // First creation
            await HealthProfileService.create(customerId, { weight: 70 });

            // Second creation attempt
            await expect(
                HealthProfileService.create(customerId, { weight: 75 })
            ).rejects.toThrow(BadRequestException);

            await expect(
                HealthProfileService.create(customerId, { weight: 75 })
            ).rejects.toThrow('Health profile already exists');
        });
    });

    describe('getMyProfile', () => {
        test('should successfully retrieve a health profile', async () => {
            const customerId = generateFakeCustomerId();
            
            await HealthProfileService.create(customerId, { weight: 80 });

            const profile = await HealthProfileService.getMyProfile(customerId);

            expect(profile).toBeDefined();
            expect(profile.customerId.toString()).toBe(customerId);
            expect(profile.weight).toBe(80);
        });

        test('should throw BadRequestException when profile does not exist', async () => {
            const fakeId = generateFakeCustomerId();

            await expect(
                HealthProfileService.getMyProfile(fakeId)
            ).rejects.toThrow(BadRequestException);

            await expect(
                HealthProfileService.getMyProfile(fakeId)
            ).rejects.toThrow('Health profile not found');
        });
    });

    describe('update', () => {
        test('should successfully update a health profile', async () => {
            const customerId = generateFakeCustomerId();
            
            await HealthProfileService.create(customerId, { weight: 80, allergies: ['None'] });

            const updatedProfile = await HealthProfileService.update(customerId, { weight: 78, dietaryRestrictions: 'Keto' });

            expect(updatedProfile).toBeDefined();
            expect(updatedProfile.weight).toBe(78);
            expect(updatedProfile.dietaryRestrictions).toBe('Keto');
            expect(updatedProfile.allergies).toContain('None'); // Ensure other fields remained
        });

        test('should throw BadRequestException when updating non-existent profile', async () => {
            const fakeId = generateFakeCustomerId();

            await expect(
                HealthProfileService.update(fakeId, { weight: 75 })
            ).rejects.toThrow(BadRequestException);

            await expect(
                HealthProfileService.update(fakeId, { weight: 75 })
            ).rejects.toThrow('Health profile not found');
        });
    });

    describe('delete', () => {
        test('should successfully delete a health profile', async () => {
            const customerId = generateFakeCustomerId();
            
            await HealthProfileService.create(customerId, { weight: 80 });

            await HealthProfileService.delete(customerId);

            // Verify it was deleted
            await expect(
                HealthProfileService.getMyProfile(customerId)
            ).rejects.toThrow('Health profile not found');
        });

        test('should throw BadRequestException when deleting non-existent profile', async () => {
            const fakeId = generateFakeCustomerId();

            await expect(
                HealthProfileService.delete(fakeId)
            ).rejects.toThrow(BadRequestException);

            await expect(
                HealthProfileService.delete(fakeId)
            ).rejects.toThrow('Health profile not found');
        });
    });
});
