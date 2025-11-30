import { HydratedDocument, Model } from "mongoose";
import { DatabaseRepository } from "./database.repository";
import { IProduct as TDocument } from '../../types/product-Interface'


export class ProductRepository extends DatabaseRepository<TDocument, HydratedDocument<TDocument>> {
    constructor(protected override readonly model: Model<HydratedDocument<TDocument>>) {
        super(model)
    }
}
