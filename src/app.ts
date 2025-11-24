import express from 'express';
import "dotenv/config.js";
import bodyParser from 'body-parser';
import connectDB from './DB/Connection';
import storeRouter from './store/Store-Router'
import { globalErrorHandling } from './utils/error.response';
import type { Request, Response, Express } from "express";
import productRouter from './product/product.router';





const bootstrap = async (): Promise<void> => {

    const app = express();
    const PORT = process.env.PORT || 3000;



    // Connect Database
    await connectDB();


    app.use(express.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    // app-routing
    app.get("/", (req: Request, res: Response) => {
        res.send("Welcome to the API");
    });





    //sub-app-routing-module
    app.use("/api/", storeRouter);
    app.use("/product", productRouter)




    //In-valid routing
    app.use("{/*dummy}", (req: Request, res: Response) => {
        res.status(400).json({ message: "Invalid application routing plz check the method and url ❌" })
    });


    //global-error-handling
    app.use(globalErrorHandling);




    // Only start the server if we're not in a serverless environment
    if (process.env.NODE_ENV !== 'production') {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} 🚀`);
        });





    }


}


// Export the Express API
export default bootstrap;
