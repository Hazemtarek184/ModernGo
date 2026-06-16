import express from "express";
import { authenticateStore, authenticateCustomer } from "../middleware/auth.middleware";
import { validation } from "../middleware/middleware-Validation";
import OrderController from "./Order-Controller";
import * as validators from "./Order-Validation";

const router = express.Router();

router.get(
    "/store/:storeId",
    authenticateStore,
    validation(validators.getStoreOrdersSchema),
    OrderController.getStoreOrders
);

router.get(
    "/customer/:customerId",
    authenticateCustomer,
    validation(validators.getCustomerOrdersSchema),
    OrderController.getCustomerOrders
);

export default router;
