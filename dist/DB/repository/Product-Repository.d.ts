import { HydratedDocument, Model } from "mongoose";
import { DatabaseRepository } from "./Database-Repository";
import { IProduct as TDocument } from '../../types/Product-Interface';
export declare class ProductRepository extends DatabaseRepository<TDocument, HydratedDocument<TDocument>> {
    protected readonly model: Model<HydratedDocument<TDocument>>;
    constructor(model: Model<HydratedDocument<TDocument>>);
}
//# sourceMappingURL=Product-Repository.d.ts.map