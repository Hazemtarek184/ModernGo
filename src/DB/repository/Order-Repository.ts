import { HydratedDocument, Model } from "mongoose";
import { DatabaseRepository } from "./Database-Repository";
import { IOrder as TDocument } from "../../types/Order-Interface";

export class OrderRepository extends DatabaseRepository<TDocument, HydratedDocument<TDocument>> {
    constructor(protected override readonly model: Model<HydratedDocument<TDocument>>) {
        super(model);
    }
}
