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
        const [order] = await this.orderRepository.create({
            data: [data]
        });
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

    async getCustomerOrders(customerId: string, page: number = 1, limit: number = 10): Promise<{ orders: IOrder[]; total: number; page: number; limit: number; totalPages: number }> {
        const skip = (page - 1) * limit;
        const total = await OrderModel.countDocuments({ customerId: new Types.ObjectId(customerId) });
        const orders = await OrderModel.find({ customerId: new Types.ObjectId(customerId) })
            .populate({
                path: "items.storeProductId",
                populate: {
                    path: "productId",
                    select: "-images"
                }
            })
            .populate("storeId", "name address phone")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec() as unknown as IOrder[];
        const totalPages = Math.ceil(total / limit);
        return { orders, total, page, limit, totalPages };
    }
}

export default new OrderService();
