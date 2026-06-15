import dotenv from "dotenv";
dotenv.config();

import mongoose, { Types } from "mongoose";
import connectDB from "../src/DB/Connection";
import { CustomerModel } from "../src/customer/Customer-Module";
import { StoreProductModel } from "../src/store-product/StoreProduct-Module";
import { CartItemModel } from "../src/cart/CartItem-Module";
import CartItemService from "../src/cart/CartItem-Service";

async function main() {
    await connectDB();
    
    try {
        // Find Omar Ali
        const customer = await CustomerModel.findOne({ email: "omar@example.com" });
        if (!customer) {
            console.error("Omar Ali not found!");
            return;
        }

        // Find a valid StoreProduct
        const storeProduct = await StoreProductModel.findOne({});
        if (!storeProduct) {
            console.error("No store products found!");
            return;
        }

        console.log(`Using customer: ${customer.firstName} ${customer.lastName} (${customer._id})`);
        console.log(`Using storeProduct ID: ${storeProduct._id} (price: ${storeProduct.price})`);

        // Clear existing cart items
        await CartItemModel.deleteMany({ customerId: customer._id });
        console.log("Cleared existing cart items for Omar");

        // Insert a new valid cart item
        const newItem = await CartItemModel.create({
            customerId: customer._id,
            storeProductId: storeProduct._id,
            quantity: 2,
            isActive: true,
        });

        console.log("Inserted new cart item:", newItem);

        // Fetch populated cart via CartItemService
        const cart = await CartItemService.getCustomerCart(customer._id.toString());
        console.log("\nPopulated Cart Items from service:", JSON.stringify(cart, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}

main();
