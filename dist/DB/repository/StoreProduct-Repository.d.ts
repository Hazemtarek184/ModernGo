import { HydratedDocument, Model } from "mongoose";
import { DatabaseRepository } from "./Database-Repository";
import { IStoreProduct as TDocument } from "../../types/StoreProduct-Interface";
export declare class StoreProductRepository extends DatabaseRepository<TDocument, HydratedDocument<TDocument>> {
    protected readonly model: Model<HydratedDocument<TDocument>>;
    constructor(model: Model<HydratedDocument<TDocument>>);
}
//# sourceMappingURL=StoreProduct-Repository.d.ts.map