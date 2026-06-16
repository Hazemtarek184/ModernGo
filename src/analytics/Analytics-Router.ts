import { Router } from "express";
import { getStoreSummary, getSalesChart, getTopProducts, getOrderStatus } from "./Analytics-Controller";

const analyticsRouter = Router();

analyticsRouter.get("/store/:storeId/summary", getStoreSummary);
analyticsRouter.get("/store/:storeId/sales-chart", getSalesChart);
analyticsRouter.get("/store/:storeId/top-products", getTopProducts);
analyticsRouter.get("/store/:storeId/order-status", getOrderStatus);

export default analyticsRouter;
