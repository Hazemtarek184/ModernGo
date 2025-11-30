import { HydratedDocument, Model } from "mongoose";
import { DatabaseRepository } from "./database.repository";
import { IStoreProduct as TDocument } from "../../types/StoreProduct-Interface";

export class StoreProductRepository extends DatabaseRepository<TDocument, HydratedDocument<TDocument>> {
    constructor(protected override readonly model: Model<HydratedDocument<TDocument>>) {
        super(model);
    }
}

