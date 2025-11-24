import { Model } from "mongoose";
import { DatabaseRepository } from "./database.repository";
import {IProduct as TDocument} from '../../types/product-Interface'


export class ProductRepository extends DatabaseRepository<TDocument> {
    constructor(protected override readonly model: Model<TDocument>) {
        super(model)
    }
}
