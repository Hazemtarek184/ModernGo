import "dotenv/config.js";
import connectDB from "./DB/Connection";
import { OrderModel } from "./order/Order-Module";
import { StoreModel } from "./store/Store-Module";
import { CustomerModel } from "./customer/Customer-Module";
import { StoreProductModel } from "./store-product/StoreProduct-Module";
import mongoose from "mongoose";

const NUM_ORDERS = 500;
const DAYS_HISTORY = 90;

const seedOrders = async () => {
    try {
        await connectDB();
        console.log("Starting order seeding process...");

        console.log("Clearing existing orders...");
        await OrderModel.deleteMany({});

        const stores = await StoreModel.find().lean();
        const customers = await CustomerModel.find().lean();
        const storeProducts = await StoreProductModel.find().lean();

        if (stores.length === 0 || storeProducts.length === 0) {
            console.error("❌ No stores or store-products found. Please seed those first.");
            process.exit(1);
        }

        // Group products by store
        const productsByStore: Record<string, any[]> = {};
        for (const sp of storeProducts) {
            const sId = sp.storeId.toString();
            if (!productsByStore[sId]) productsByStore[sId] = [];
            productsByStore[sId].push(sp);
        }

        const storesWithProducts = stores.filter(s => productsByStore[s._id.toString()] && productsByStore[s._id.toString()].length > 0);

        if (storesWithProducts.length === 0) {
            console.error("❌ No store has any products. Please seed store-products first.");
            process.exit(1);
        }

        const now = Date.now();
        const past = now - DAYS_HISTORY * 24 * 60 * 60 * 1000;

        const ordersToInsert = [];

        for (let i = 0; i < NUM_ORDERS; i++) {
            // Pick a random store
            const store = storesWithProducts[Math.floor(Math.random() * storesWithProducts.length)];
            const availableProducts = productsByStore[store._id.toString()];

            // Pick a random customer (20% chance of being a phantom/guest)
            let customerId = undefined;
            if (customers.length > 0 && Math.random() > 0.2) {
                const customer = customers[Math.floor(Math.random() * customers.length)];
                customerId = customer._id;
            }

            // Pick 1 to 5 random products
            const numItems = Math.floor(Math.random() * 5) + 1;
            const items = [];
            let totalAmount = 0;

            for (let j = 0; j < numItems; j++) {
                const sp = availableProducts[Math.floor(Math.random() * availableProducts.length)];
                // Avoid duplicates in the same order
                if (items.some(item => item.storeProductId.toString() === sp._id.toString())) {
                    continue;
                }

                const quantity = Math.floor(Math.random() * 3) + 1; // 1 to 3
                const price = sp.price || Math.floor(Math.random() * 50) + 5;

                items.push({
                    storeProductId: sp._id,
                    quantity,
                    price
                });

                totalAmount += quantity * price;
            }

            if (items.length === 0) continue;

            const randomDate = new Date(past + Math.random() * (now - past));

            const orderDoc: any = {
                storeId: store._id,
                items,
                totalAmount,
                status: Math.random() > 0.05 ? 'completed' : 'cancelled', // 5% cancelled
                createdAt: randomDate,
                updatedAt: randomDate
            };

            if (customerId) {
                orderDoc.customerId = customerId;
            }

            ordersToInsert.push(orderDoc);
        }

        console.log(`Inserting ${ordersToInsert.length} simulated orders spanning the last ${DAYS_HISTORY} days...`);
        
        // Use collection.insertMany to bypass Mongoose's timestamps plugin overwriting our fake dates
        if (ordersToInsert.length > 0) {
            await OrderModel.collection.insertMany(ordersToInsert);
        }

        console.log("✅ Orders seeded successfully!");

    } catch (error) {
        console.error("❌ Error seeding orders:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Database connection closed.");
        process.exit(0);
    }
};

seedOrders();
