import express from 'express';
import "dotenv/config.js";
import cors from 'cors';
import bodyParser from 'body-parser';
import { globalErrorHandling } from './utils/error.response';
import type { NextFunction, Request, Response } from "express";
import storesRouter from './store/Store-Router';
import productsRouter from './product/Product-Router';
import storeProductsRouter from './store-product/StoreProduct-Router';
import customersRouter from './customer/Customer-Router';
import healthProfileRouter from './health-profile/HealthProfile-Router';
import cartItemRouter from "./cart/CartItem-Router";

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
