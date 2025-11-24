import { Model } from "mongoose";
import { DatabaseRepository } from "./database.repository";
import { IProduct as TDocument } from '../../types/product-Interface';
export declare class ProductRepository extends DatabaseRepository<TDocument> {
    protected readonly model: Model<TDocument>;
    constructor(model: Model<TDocument>);
}
//# sourceMappingURL=product.repository.d.ts.map