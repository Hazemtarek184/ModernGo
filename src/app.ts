import express from 'express';
import "dotenv/config.js";
import bodyParser from 'body-parser';
import connectDB from './DB/Connection';
import storesRouter from './store/Store-Router';
import { globalErrorHandling } from './utils/error.response';
import type { Request, Response } from "express";
import productsRouter from './product/Product-Router';
import storeProductsRouter from './store-product/StoreProduct-Router';
import customersRouter from './customer/Customer-Router';

const app = express();
const PORT = process.env.PORT || 3000;

// Connect Database
connectDB();

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
app.use("/api", storeProductsRouter); // Handles nested routes like /api/stores/:id/products

//In-valid routing
app.use("{/*dummy}", (req: Request, res: Response) => {
    res.status(400).json({ message: "Invalid application routing please check the method and url ❌" })
});

// Global error handling middleware
app.use(globalErrorHandling);

// Only start server if not in Vercel (Vercel handles this)
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} 🚀`);
    });
}

// Export for Vercel
export default app;
