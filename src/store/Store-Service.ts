import { storeModel } from "./Store-Module";
import { Store } from "../types/Store-Interface";
import { Types } from "mongoose";

/**
 * Service layer for Store operations
 * Handles all database interactions and business logic
 */

// Type for creating a store (without auto-generated fields)
type CreateStoreData = Omit<Store, '_id' | 'createdAt' | 'updatedAt'>;

// Type for updating a store (all fields optional except _id)
type UpdateStoreData = Partial<Omit<Store, '_id' | 'createdAt' | 'updatedAt'>>;

export const getAllStores = async (): Promise<Store[]> => {
    return await storeModel.find().lean();
};

export const getStoreById = async (storeId: string): Promise<Store | null> => {
    return await storeModel.findById(storeId).lean();
};

export const createNewStore = async (storeData: CreateStoreData): Promise<Store> => {
    const newStore = await storeModel.create(storeData);
    return newStore.toObject();
};

export const updateStoreById = async (
    storeId: string,
    updateData: UpdateStoreData
): Promise<Store | null> => {
    return await storeModel.findByIdAndUpdate(
        storeId,
        updateData,
        { new: true, runValidators: true }
    ).lean();
};

export const deleteStoreById = async (storeId: string): Promise<Store | null> => {
    return await storeModel.findByIdAndDelete(storeId).lean();
};

export const findStoresNearLocation = async (
    longitude: number,
    latitude: number,
    maxDistance: number = 5000
): Promise<Store[]> => {
    return await storeModel.find({
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
};

export const searchStoresByNamePattern = async (searchQuery: string): Promise<Store[]> => {
    return await storeModel.find({
        name: { $regex: searchQuery, $options: 'i' }
    }).lean();
};

export const findStoresByCategory = async (category: string): Promise<Store[]> => {
    return await storeModel.find({
        categories: category
    }).lean();
};

export const findStoresByCategories = async (categories: string[]): Promise<Store[]> => {
    return await storeModel.find({
        categories: { $in: categories }
    }).lean();
};

export const getStoreCount = async (): Promise<number> => {
    return await storeModel.countDocuments();
};

export const getStoresByIds = async (storeIds: string[]): Promise<Store[]> => {
    const objectIds = storeIds.map(id => new Types.ObjectId(id));
    return await storeModel.find({
        _id: { $in: objectIds }
    }).lean();
};

export const checkStoreExists = async (storeId: string): Promise<boolean> => {
    const count = await storeModel.countDocuments({ _id: storeId });
    return count > 0;
};

export const getStoresWithPagination = async (
    page: number = 1,
    limit: number = 10
): Promise<{ stores: Store[]; total: number; page: number; pages: number }> => {
    const skip = (page - 1) * limit;

    const [stores, total] = await Promise.all([
        storeModel.find().skip(skip).limit(limit).lean(),
        storeModel.countDocuments()
    ]);

    return {
        stores,
        total,
        page,
        pages: Math.ceil(total / limit)
    };
};