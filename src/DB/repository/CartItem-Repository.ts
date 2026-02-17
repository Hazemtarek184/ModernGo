import { HydratedDocument, Model, Types } from "mongoose";
import { DatabaseRepository } from "./Database-Repository";
import { ICartItem as TDocument } from "../../types/CartItem-Interface";

export class CartItemRepository extends DatabaseRepository<TDocument, HydratedDocument<TDocument>> {
    constructor(protected override readonly model: Model<HydratedDocument<TDocument>>) {
        super(model);
    }

    /** Return every cart item for a given customer */
    async findByCustomerId(customerId: Types.ObjectId) {
        return this.find({
            filter: { customerId } as any,
            options: {
                populate: [
                    { path: "storeProductId", populate: { path: "productId" } },
                ],
            },
        });
    }

    /** Find a specific customer + storeProduct combination */
    async findByCustomerAndProduct(customerId: Types.ObjectId, storeProductId: Types.ObjectId) {
        return this.findOne({
            filter: { customerId, storeProductId } as any,
        });
    }
}
