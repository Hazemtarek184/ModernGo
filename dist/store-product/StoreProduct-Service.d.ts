import { Types } from "mongoose";
declare class StoreProductService {
    private storeProductRepository;
    constructor();
    addProductToStore(storeId: string, productId: string, price: number, stock: number, isAvailable?: boolean): Promise<import("mongoose").Document<unknown, {}, import("../types/StoreProduct-Interface").IStoreProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../types/StoreProduct-Interface").IStoreProduct & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getStoreProducts(storeId: string): Promise<[] | (import("mongoose").Document<unknown, {}, import("../types/StoreProduct-Interface").IStoreProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../types/StoreProduct-Interface").IStoreProduct & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[] | import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("../types/StoreProduct-Interface").IStoreProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../types/StoreProduct-Interface").IStoreProduct & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>[]>;
    getProductStores(productId: string): Promise<[] | (import("mongoose").Document<unknown, {}, import("../types/StoreProduct-Interface").IStoreProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../types/StoreProduct-Interface").IStoreProduct & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[] | import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("../types/StoreProduct-Interface").IStoreProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../types/StoreProduct-Interface").IStoreProduct & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>[]>;
    updateStoreProduct(storeId: string, productId: string, updates: {
        price?: number | undefined;
        stock?: number | undefined;
        isAvailable?: boolean | undefined;
    }): Promise<(import("mongoose").Document<unknown, {}, import("../types/StoreProduct-Interface").IStoreProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../types/StoreProduct-Interface").IStoreProduct & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("../types/StoreProduct-Interface").IStoreProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../types/StoreProduct-Interface").IStoreProduct & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>>;
    removeProductFromStore(storeId: string, productId: string): Promise<(import("mongoose").Document<unknown, {}, import("../types/StoreProduct-Interface").IStoreProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../types/StoreProduct-Interface").IStoreProduct & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("../types/StoreProduct-Interface").IStoreProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../types/StoreProduct-Interface").IStoreProduct & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>>;
}
declare const _default: StoreProductService;
export default _default;
//# sourceMappingURL=StoreProduct-Service.d.ts.map