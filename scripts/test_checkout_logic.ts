import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../src/DB/Connection";
import { CustomerModel } from "../src/customer/Customer-Module";
import { CartItemModel } from "../src/cart/CartItem-Module";
import { StoreProductModel } from "../src/store-product/StoreProduct-Module";
import { ProductModel } from "../src/product/Product-Module";
import { StoreModel } from "../src/store/Store-Module";

async function main() {
    await connectDB();
    
    // Force registration of models by referencing them
    const pModel = ProductModel;
    const sModel = StoreModel;
    console.log("Mongoose registered models:", mongoose.modelNames());
    
    try {
        const testCustomer = await CustomerModel.findOne({ email: "test@test.com" }).lean();
        if (!testCustomer) {
            console.error("Test customer not found");
            return;
        }
        
        console.log(`Customer: ${testCustomer.email} (ID: ${testCustomer._id})`);
        
        // Find cart items populated
        const cartItems = await CartItemModel.find({ customerId: testCustomer._id })
            .populate({
                path: "storeProductId",
                populate: { path: "productId" }
            })
            .lean();
            
        console.log("Cart Items from DB (Populated & Lean):");
        console.log(JSON.stringify(cartItems, null, 2));
        
        console.log("\n--- Simulating createOrderFromCart ---");
        let totalAmount = 0;
        const orderItems: any[] = [];
        let storeId: mongoose.Types.ObjectId | null = null;

        for (const item of cartItems) {
            console.log(`Processing item:`, {
                quantity: item.quantity,
                storeProductId: item.storeProductId
            });
            
            const spId = typeof item.storeProductId === 'object' && item.storeProductId._id 
                ? item.storeProductId._id 
                : item.storeProductId;
                
            console.log(`Extracted spId: ${spId}`);
            
            const storeProduct = await StoreProductModel.findById(spId).lean();
            console.log(`Fetched storeProduct from DB:`, storeProduct);
            
            if (!storeProduct) {
                console.log(`Store product not found for ID: ${spId}`);
                continue;
            }

            if (!storeId) {
                storeId = storeProduct.storeId as mongoose.Types.ObjectId;
                console.log(`Set storeId to: ${storeId}`);
            }

            const price = storeProduct.price || 0;
            totalAmount += price * item.quantity;
            
            orderItems.push({
                storeProductId: storeProduct._id,
                quantity: item.quantity,
                price: price
            });
        }
        
        console.log("Resulting values:", {
            storeId,
            orderItems,
            totalAmount
        });
        
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}

main();
