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

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const result = await OrderService.getCustomerOrders(customerId!, page, limit);

        return successResponse({
            res,
            statuscode: 200,
            data: result
        });
    };

    getMyOrders = async (req: Request, res: Response): Promise<Response> => {
        const customerId = req.customer!.customerId;

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const result = await OrderService.getCustomerOrders(customerId, page, limit);

        return successResponse({
            res,
            statuscode: 200,
            data: result
        });
    };
}

export default new OrderController();
