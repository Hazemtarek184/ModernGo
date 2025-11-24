import { Store } from "../types/Store-Interface";
type CreateStoreData = Omit<Store, '_id' | 'createdAt' | 'updatedAt'>;
type UpdateStoreData = Partial<Omit<Store, '_id' | 'createdAt' | 'updatedAt'>>;
export declare const getAllStores: () => Promise<Store[]>;
export declare const getStoreById: (storeId: string) => Promise<Store | null>;
export declare const createNewStore: (storeData: CreateStoreData) => Promise<Store>;
export declare const updateStoreById: (storeId: string, updateData: UpdateStoreData) => Promise<Store | null>;
export declare const deleteStoreById: (storeId: string) => Promise<Store | null>;
export declare const findStoresNearLocation: (longitude: number, latitude: number, maxDistance?: number) => Promise<Store[]>;
export declare const searchStoresByNamePattern: (searchQuery: string) => Promise<Store[]>;
export declare const findStoresByCategory: (category: string) => Promise<Store[]>;
export declare const findStoresByCategories: (categories: string[]) => Promise<Store[]>;
export declare const getStoreCount: () => Promise<number>;
export declare const getStoresByIds: (storeIds: string[]) => Promise<Store[]>;
export declare const checkStoreExists: (storeId: string) => Promise<boolean>;
export declare const getStoresWithPagination: (page?: number, limit?: number) => Promise<{
    stores: Store[];
    total: number;
    page: number;
    pages: number;
}>;
export {};
//# sourceMappingURL=Store-Service.d.ts.map