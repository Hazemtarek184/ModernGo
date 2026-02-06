import { Types } from "mongoose";
import { StoreModel } from "./Store-Module";
import { StoreRepository } from "../DB/repository/Store-Repository";
import { BadRequestException, NotFoundException } from "../utils/error.response";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.utils";

interface RegisterStoreDto {
    name: string;
    email: string;
    password: string;
    address: string;
    phone: string;
    location: {
        type: 'Point';
        coordinates: [number, number];
        address?: string | undefined;
    };
    categories: string[];
}

interface LoginStoreDto {
    email: string;
    password: string;
}

interface UpdateStoreDto {
    name?: string | undefined;
    address?: string | undefined;
    phone?: string | undefined;
    location?: {
        type: 'Point';
        coordinates: [number, number];
        address?: string | undefined;
    } | undefined;
    categories?: string[] | undefined;
}

interface UpdatePasswordDto {
    currentPassword: string;
    newPassword: string;
}

class StoreService {
    private storeRepository = new StoreRepository(StoreModel);

    constructor() { }

    // ─── Auth Methods ───────────────────────────────────────────

    /**
     * Register a new store
     */
    async registerStore(dto: RegisterStoreDto) {
        // Check if email already exists
        const existingEmail = await this.storeRepository.findByEmail(dto.email);
        if (existingEmail) {
            throw new BadRequestException("Email already registered");
        }

        // Create store (password will be hashed by pre-save hook)
        const [store] = await this.storeRepository.create({
            data: [{
                name: dto.name,
                email: dto.email.toLowerCase().trim(),
                password: dto.password,
                address: dto.address,
                phone: dto.phone.trim(),
                location: dto.location,
                categories: dto.categories,
            }]
        });

        if (!store) {
            throw new BadRequestException("Failed to create store account");
        }

        // Return store without password
        const storeObject = store.toObject();
        const { password, ...storeWithoutPassword } = storeObject;

        // Generate JWT token
        const token = generateToken(store._id!, store.email, 'store');

        return {
            store: storeWithoutPassword,
            token
        };
    }

    /**
     * Login store
     */
    async loginStore(dto: LoginStoreDto) {
        // Find store by email with password field
        const store = await this.storeRepository.findByEmailWithPassword(dto.email);

        if (!store) {
            throw new BadRequestException("Invalid email or password");
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(dto.password, store.password);

        if (!isPasswordValid) {
            throw new BadRequestException("Invalid email or password");
        }

        // Return store without password
        const storeObject = store.toObject();
        const { password, ...storeWithoutPassword } = storeObject;

        // Generate JWT token
        const token = generateToken(store._id!, store.email, 'store');

        return {
            store: storeWithoutPassword,
            token
        };
    }

    /**
     * Update store password
     */
    async updatePassword(storeId: string, dto: UpdatePasswordDto) {
        // Validate store ID format
        if (!Types.ObjectId.isValid(storeId)) {
            throw new BadRequestException("Invalid storeId format");
        }

        // Find store with password
        const store = await this.storeRepository.findByIdWithPassword(new Types.ObjectId(storeId));

        if (!store) {
            throw new NotFoundException("Store not found");
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(dto.currentPassword, store.password);

        if (!isPasswordValid) {
            throw new BadRequestException("Current password is incorrect");
        }

        // Update password (will be hashed by pre-save hook)
        store.password = dto.newPassword;
        await store.save();

        return { message: "Password updated successfully" };
    }

    // ─── CRUD Methods ───────────────────────────────────────────

    /**
     * Get all stores
     */
    async getAllStores() {
        return await StoreModel.find().lean();
    }

    /**
     * Get store by ID
     */
    async getStoreById(storeId: string) {
        if (!Types.ObjectId.isValid(storeId)) {
            throw new BadRequestException("Invalid storeId format");
        }

        const store = await this.storeRepository.findOne({
            filter: { _id: new Types.ObjectId(storeId) }
        });

        if (!store) {
            throw new NotFoundException("Store not found");
        }

        return store;
    }

    /**
     * Update store
     */
    async updateStore(storeId: string, dto: UpdateStoreDto) {
        if (!Types.ObjectId.isValid(storeId)) {
            throw new BadRequestException("Invalid storeId format");
        }

        // Check if store exists
        const store = await this.storeRepository.findOne({
            filter: { _id: new Types.ObjectId(storeId) }
        });

        if (!store) {
            throw new NotFoundException("Store not found");
        }

        // Build update object
        const updatedStore = await this.storeRepository.findOneAndUpdate({
            filter: { _id: new Types.ObjectId(storeId) },
            update: {
                ...(dto.name && { name: dto.name }),
                ...(dto.address && { address: dto.address }),
                ...(dto.phone && { phone: dto.phone.trim() }),
                ...(dto.location && { location: dto.location }),
                ...(dto.categories && { categories: dto.categories }),
            },
            options: { new: true }
        });

        if (!updatedStore) {
            throw new BadRequestException("Failed to update store");
        }

        return updatedStore;
    }

    /**
     * Delete store
     */
    async deleteStore(storeId: string) {
        if (!Types.ObjectId.isValid(storeId)) {
            throw new BadRequestException("Invalid storeId format");
        }

        const deletedStore = await this.storeRepository.findOneAndDelete({
            filter: { _id: new Types.ObjectId(storeId) }
        });

        if (!deletedStore) {
            throw new NotFoundException("Store not found");
        }

        return deletedStore;
    }

    // ─── Query Methods ──────────────────────────────────────────

    /**
     * Find stores near a location
     */
    async findStoresNearLocation(longitude: number, latitude: number, maxDistance: number = 5000) {
        return await StoreModel.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: maxDistance
                }
            }
        }).lean();
    }

    /**
     * Search stores by name pattern
     */
    async searchStoresByNamePattern(searchQuery: string) {
        return await StoreModel.find({
            name: { $regex: searchQuery, $options: 'i' }
        }).lean();
    }

    /**
     * Find stores by category
     */
    async findStoresByCategory(category: string) {
        return await StoreModel.find({
            categories: category
        }).lean();
    }

    /**
     * Get total store count
     */
    async getStoreCount() {
        return await StoreModel.countDocuments();
    }

    /**
     * Check if store exists
     */
    async checkStoreExists(storeId: string) {
        const count = await StoreModel.countDocuments({ _id: storeId });
        return count > 0;
    }

    /**
     * Get stores with pagination
     */
    async getStoresWithPagination(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [stores, total] = await Promise.all([
            StoreModel.find().skip(skip).limit(limit).lean(),
            StoreModel.countDocuments()
        ]);

        return {
            stores,
            total,
            page,
            pages: Math.ceil(total / limit)
        };
    }
}

export default new StoreService();
