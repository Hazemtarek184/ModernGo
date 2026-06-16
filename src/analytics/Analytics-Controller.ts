import { Request, Response, NextFunction } from "express";
import { successResponse } from "../utils/success.response";
import AnalyticsService from "./Analytics-Service";
import { BadRequestException } from "../utils/error.response";

export const getStoreSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { storeId } = req.params;
        let period = parseInt(req.query.period as string);

        if (isNaN(period) || period <= 0) {
            period = 7; // default to 7 days
        }

        if (!storeId) {
            throw new BadRequestException("Store ID is required");
        }

        const summary = await AnalyticsService.getStoreSummary(storeId, period);

        return successResponse({
            res,
            statuscode: 200,
            message: "Store analytics retrieved successfully",
            data: summary
        });
    } catch (error) {
        return next(error);
    }
};

export const getSalesChart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { storeId } = req.params;
        let period = parseInt(req.query.period as string) || 7;

        if (!storeId) throw new BadRequestException("Store ID is required");

        const data = await AnalyticsService.getSalesChartData(storeId, period);

        return successResponse({
            res,
            statuscode: 200,
            message: "Sales chart retrieved successfully",
            data
        });
    } catch (error) {
        return next(error);
    }
};

export const getTopProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { storeId } = req.params;
        let period = parseInt(req.query.period as string) || 7;
        let limit = parseInt(req.query.limit as string) || 5;
        let sortBy = req.query.sortBy as 'quantity' | 'revenue';

        if (sortBy !== 'quantity' && sortBy !== 'revenue') {
            sortBy = 'quantity';
        }

        if (!storeId) throw new BadRequestException("Store ID is required");

        const data = await AnalyticsService.getTopProducts(storeId, period, limit, sortBy);

        return successResponse({
            res,
            statuscode: 200,
            message: "Top products retrieved successfully",
            data
        });
    } catch (error) {
        return next(error);
    }
};

export const getOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { storeId } = req.params;
        let period = parseInt(req.query.period as string) || 7;

        if (!storeId) throw new BadRequestException("Store ID is required");

        const data = await AnalyticsService.getOrderStatusBreakdown(storeId, period);

        return successResponse({
            res,
            statuscode: 200,
            message: "Order status retrieved successfully",
            data
        });
    } catch (error) {
        return next(error);
    }
};
