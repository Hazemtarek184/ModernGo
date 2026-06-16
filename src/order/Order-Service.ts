import { Types } from "mongoose";
import { OrderModel } from "./Order-Module";
import { OrderRepository } from "../DB/repository/Order-Repository";
import { IOrder, IOrderItem } from "../types/Order-Interface";

class OrderService {
    private orderRepository = new OrderRepository(OrderModel as any);

    async createOrder(data: {
        storeId: Types.ObjectId;
        customerId?: Types.ObjectId;
        items: IOrderItem[];
        totalAmount: number;
    }): Promise<IOrder> {
        const order = await this.orderRepository.create(data as any);
        return order as unknown as IOrder;
    }

    async getStoreOrders(storeId: string): Promise<IOrder[]> {
        return await OrderModel.find({ storeId: new Types.ObjectId(storeId) })
            .populate({
                path: "items.storeProductId",
                populate: {
                    path: "productId"
                }
            })
            .populate("customerId", "firstName lastName email phone")
            .sort({ createdAt: -1 })
            .exec() as unknown as IOrder[];
    }

    async getCustomerOrders(customerId: string): Promise<IOrder[]> {
        return await OrderModel.find({ customerId: new Types.ObjectId(customerId) })
            .populate({
                path: "items.storeProductId",
                populate: {
                    path: "productId"
                }
            })
            .populate("storeId", "name profilePhoto address phone")
            .sort({ createdAt: -1 })
            .exec() as unknown as IOrder[];
    }
}

export default new OrderService();
