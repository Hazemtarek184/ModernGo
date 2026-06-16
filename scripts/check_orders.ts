import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../src/DB/Connection";
import { OrderModel } from "../src/order/Order-Module";

async function main() {
    await connectDB();
    
    try {
        console.log("--- Orders Count ---");
        const totalOrders = await OrderModel.countDocuments({});
        console.log(`Total orders in DB: ${totalOrders}`);

        console.log("\n--- Orders for test@test.com (customerId: 6a31beca7d624eb4492fde17) ---");
        const orders = await OrderModel.find({ customerId: new mongoose.Types.ObjectId("6a31beca7d624eb4492fde17") }).lean();
        console.log(JSON.stringify(orders, null, 2));

        console.log("\n--- Last 5 Orders in DB ---");
        const lastOrders = await OrderModel.find().sort({ createdAt: -1 }).limit(5).lean();
        console.log(JSON.stringify(lastOrders, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}

main();
