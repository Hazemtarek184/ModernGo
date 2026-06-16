import type { Request, Response } from "express";
import { ForbiddenException } from "../utils/error.response";
import { successResponse } from "../utils/success.response";
import OrderService from "./Order-Service";

class OrderController {
    constructor() { }

    getStoreOrders = async (req: Request, res: Response): Promise<Response> => {
        const { storeId } = req.params;

        if (req.store?.storeId !== storeId) {
            throw new ForbiddenException("You can only view your own store's orders");
        }

        const orders = await OrderService.getStoreOrders(storeId!);

        return successResponse({
            res,
            statuscode: 200,
            data: { orders, count: orders.length }
        });
    };

    getCustomerOrders = async (req: Request, res: Response): Promise<Response> => {
        const { customerId } = req.params;

        if (req.customer?.customerId !== customerId) {
            throw new ForbiddenException("You can only view your own order history");
        }

        const orders = await OrderService.getCustomerOrders(customerId!);

        return successResponse({
            res,
            statuscode: 200,
            data: { orders, count: orders.length }
        });
    };

    getMyOrders = async (req: Request, res: Response): Promise<Response> => {
        const customerId = req.customer!.customerId;

        const orders = await OrderService.getCustomerOrders(customerId);

        return successResponse({
            res,
            statuscode: 200,
            data: { orders, count: orders.length }
        });
    };
}

export default new OrderController();
