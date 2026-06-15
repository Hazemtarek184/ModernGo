import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../src/DB/Connection";
import { CustomerModel } from "../src/customer/Customer-Module";
import { StoreProductModel } from "../src/store-product/StoreProduct-Module";
import { ProductModel } from "../src/product/Product-Module";
import { CartItemModel } from "../src/cart/CartItem-Module";

async function main() {
    await connectDB();
    
    try {
        console.log("--- Customers ---");
        const customers = await CustomerModel.find({}, "firstName lastName email").lean();
        console.log(JSON.stringify(customers, null, 2));

        console.log("\n--- Store Products (first 5) ---");
        const storeProducts = await StoreProductModel.find().limit(5).lean();
        for (const sp of storeProducts) {
            const prod = await ProductModel.findById(sp.productId).lean();
            console.log(`StoreProduct ID: ${sp._id}, Price: ${sp.price}, Product: ${prod ? prod.name : "Unknown"}`);
        }

        console.log("\n--- Cart Items ---");
        const cartItems = await CartItemModel.find().lean();
        console.log(JSON.stringify(cartItems, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}

main();
