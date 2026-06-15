import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { generateToken } from "../src/utils/jwt.utils";

async function main() {
    const customerId = "69950b667f745e04df555d24"; // Omar Ali
    const email = "omar@example.com";
    const token = generateToken(new mongoose.Types.ObjectId(customerId), email, "customer");

    console.log("Generated Token:", token);
    console.log("Firing GET request to http://localhost:3000/api/cart/me...");

    try {
        const response = await fetch("http://localhost:3000/api/cart/me", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        console.log("Status:", response.status);
        const body = await response.json();
        console.log("Response Body:", JSON.stringify(body, null, 2));

        if (body.success && body.data && body.data.length > 0) {
            const item = body.data[0];
            console.log("\n--- Verification ---");
            console.log("CartItem ID:", item._id);
            console.log("StoreProduct ID:", item.storeProductId?._id);
            console.log("Product Name:", item.storeProductId?.productId?.name);
            console.log("Product Price:", item.storeProductId?.price);
            
            if (item.storeProductId?.productId?.name) {
                console.log("\nSUCCESS: Product details populated correctly! ✅");
            } else {
                console.log("\nFAILURE: Product name missing or not populated! ❌");
            }
        } else {
            console.log("No items in cart or query failed.");
        }
    } catch (err) {
        console.error("Fetch failed:", err);
    }
}

main();
