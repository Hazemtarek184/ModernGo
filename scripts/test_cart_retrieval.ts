import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../src/DB/Connection";
import CartItemService from "../src/cart/CartItem-Service";
import { CartItemModel } from "../src/cart/CartItem-Module";

async function main() {
    await connectDB();
    
    try {
        console.log("--- Querying all CartItem documents raw ---");
        const rawItems = await CartItemModel.find({});
        console.log("Raw items length:", rawItems.length);
        console.log("Raw items:", JSON.stringify(rawItems, null, 2));

        console.log("\n--- Querying via CartItemService.getCustomerCart ---");
        // Let's get the customerId from the first item, or use the one from .env
        const customerId = rawItems[0] ? rawItems[0].customerId.toString() : "69950b667f745e04df555d24";
        console.log(`Fetching cart for customerId: ${customerId}`);
        const cartItems = await CartItemService.getCustomerCart(customerId);
        console.log("Cart items returned by service:", JSON.stringify(cartItems, null, 2));
    } catch (err) {
        console.error("Error in main:", err);
    } finally {
        await mongoose.connection.close();
    }
}

main();
