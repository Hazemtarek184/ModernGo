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
}

export default new OrderService();
