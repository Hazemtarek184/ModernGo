import express from 'express';
import "dotenv/config.js";
import cors from 'cors';
import bodyParser from 'body-parser';
import storesRouter from './store/Store-Router';
import { globalErrorHandling } from './utils/error.response';
import type { NextFunction, Request, Response } from "express";
import productsRouter from './product/Product-Router';
import storeProductsRouter from './store-product/StoreProduct-Router';
import customersRouter from './customer/Customer-Router';
import healthProfileRouter from './health-profile/HealthProfile-Router';
import cartItemRouter from "./cart/CartItem-Router";
import { CustomerModel } from './customer/Customer-Module';
import { StoreModel } from './store/Store-Module';
import { ProductModel } from './product/Product-Module';
import { StoreProductModel } from './store-product/StoreProduct-Module';
import { CartItemModel } from './cart/CartItem-Module';
import { HealthProfileModel } from './health-profile/HealthProfile-Modul';

const app = express();

// CORS Configuration for Mobile/React Native Apps
const corsOptions = {
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app-routing
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ success: true, message: "API is running! 🚀" });
});

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ success: true, message: "Server is healthy!" });
});

app.get("/api/debug/all", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customers = await CustomerModel.find().lean();
        const stores = await StoreModel.find().lean();
        const products = await ProductModel.find().lean();
        const storeProducts = await StoreProductModel.find().lean();
        const cartItems = await CartItemModel.find().lean();
        const healthProfiles = await HealthProfileModel.find().lean();

        return res.status(200).json({
            success: true,
            message: "Database data fetched successfully",
            data: {
                customers,
                stores,
                products,
                storeProducts,
                cartItems,
                healthProfiles,
            },
        });
    } catch (error) {
        return next(error);
    }
});
// API Routes
app.use("/api/stores", storesRouter);
app.use("/api/products", productsRouter);
app.use("/api/customers", customersRouter);
app.use("/api/health-profiles", healthProfileRouter);
app.use("/api", storeProductsRouter); // Handles nested routes like /api/stores/:id/products
app.use("/api/cart", cartItemRouter);

// Catch-all for invalid routes (must be after all valid routes)
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: "Invalid application routing - please check the method and URL ❌",
        path: req.path,
        method: req.method
    });
});

// Global error handling middleware
app.use(globalErrorHandling);

// Export for Vercel
export default app;
