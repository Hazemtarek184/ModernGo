import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../src/DB/Connection";
import { CustomerModel } from "../src/customer/Customer-Module";
import { OrderModel } from "../src/order/Order-Module";

async function main() {
    await connectDB();
    
    try {
        const testCustomer = await CustomerModel.findOne({ email: "test@test.com" }).lean();
        if (!testCustomer) {
            console.error("Test customer test@test.com not found!");
            return;
        }
        
        console.log(`Found test@test.com with ID: ${testCustomer._id}`);
        
        // Update all orders that have any customerId to point to this customerId
        // so that the order history is populated for testing.
        const result = await OrderModel.updateMany(
            { customerId: { $exists: true } },
            { $set: { customerId: testCustomer._id } }
        );
        
        console.log(`Updated ${result.modifiedCount} orders to belong to test@test.com`);
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}

main();
