import { HydratedDocument, Model } from "mongoose";
import { DatabaseRepository } from "./Database-Repository";
import { IProduct as TDocument } from '../../types/Product-Interface'


export class ProductRepository extends DatabaseRepository<TDocument, HydratedDocument<TDocument>> {
    constructor(protected override readonly model: Model<HydratedDocument<TDocument>>) {
        super(model)
    }
}
