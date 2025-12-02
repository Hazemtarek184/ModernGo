import { Types } from "mongoose";
interface CreateProductDto {
    name: string;
    description: string;
    mainPrice: number;
    discountPercent?: number | undefined;
    stock: number;
    slug?: string | undefined;
}
interface UpdateProductDto {
    name?: string | undefined;
    description?: string | undefined;
    mainPrice?: number | undefined;
    discountPercent?: number | undefined;
    stock?: number | undefined;
    slug?: string | undefined;
}
declare class ProductService {
    private productRepository;
    constructor();
    createProduct(dto: CreateProductDto, files: Express.Multer.File[]): Promise<import("mongoose").Document<unknown, {}, import("../types/Product-Interface").IProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../types/Product-Interface").IProduct & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateProduct(productId: string, dto: UpdateProductDto): Promise<(import("mongoose").Document<unknown, {}, import("../types/Product-Interface").IProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../types/Product-Interface").IProduct & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("../types/Product-Interface").IProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../types/Product-Interface").IProduct & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>>;
    updateProductAttachment(productId: string, files: Express.Multer.File[], updateData?: any): Promise<(import("mongoose").Document<unknown, {}, import("../types/Product-Interface").IProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../types/Product-Interface").IProduct & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("../types/Product-Interface").IProduct, {}, import("mongoose").DefaultSchemaOptions> & import("../types/Product-Interface").IProduct & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>>;
    freezeProduct(productId: string): Promise<{
        productId: string;
    }>;
    restoreProduct(productId: string): Promise<void>;
}
declare const _default: ProductService;
export default _default;
//# sourceMappingURL=Product-Service.d.ts.map