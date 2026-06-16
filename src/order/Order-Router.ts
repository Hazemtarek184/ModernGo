import express from "express";
import type { Request, Response, NextFunction } from "express";
import { authenticateStore, authenticateCustomer } from "../middleware/auth.middleware";
import { validation } from "../middleware/middleware-Validation";
import OrderController from "./Order-Controller";
import * as validators from "./Order-Validation";

const router = express.Router();

// Middleware to trim whitespace/newlines from path parameters
const trimParams = (req: Request, res: Response, next: NextFunction) => {
    if (req.params) {
        for (const key of Object.keys(req.params)) {
            if (typeof req.params[key] === 'string') {
                req.params[key] = req.params[key].trim();
            }
        }
    }
    next();
};

router.get(
    "/store/:storeId",
    authenticateStore,
    trimParams,
    validation(validators.getStoreOrdersSchema),
    OrderController.getStoreOrders
);

router.get(
    "/customer/:customerId",
    authenticateCustomer,
    trimParams,
    validation(validators.getCustomerOrdersSchema),
    OrderController.getCustomerOrders
);

export default router;
