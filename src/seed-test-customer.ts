/**
 * Seed a test customer account.
 *
 * Credentials:
 *   email:    test@test.com
 *   password: test
 *
 * Run: npx tsx src/seed-test-customer.ts
 */
import "dotenv/config.js";
import bcrypt from "bcrypt";
import { CustomerModel } from "./customer/Customer-Module";
import connectDB from "./DB/Connection";

async function seedTestCustomer() {
    await connectDB();

    const email = "test@test.com";
    const phone = "01000000000";

    // Check if already exists
    const existing = await CustomerModel.findOne({ email }).lean();
    if (existing) {
        console.log(`[Seed] Test customer already exists (${existing._id})`);
        await (await import("mongoose")).default.disconnect();
        return;
    }

    // Hash password manually (bypasses Mongoose pre-save hook & minlength: 8)
    const password = await bcrypt.hash("test", 10);

    // Use insertOne on the raw collection to skip schema validation
    const result = await CustomerModel.collection.insertOne({
        firstName: "Test",
        lastName: "User",
        email,
        phone,
        password,
        address: {
            street: "123 Test St",
            city: "Cairo",
            state: "Cairo Governorate",
            postalCode: "12345",
            country: "Egypt",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    console.log(`[Seed] Test customer created with id: ${result.insertedId}`);
    console.log(`[Seed] Email:    ${email}`);
    console.log(`[Seed] Password: test`);

    await (await import("mongoose")).default.disconnect();
}

seedTestCustomer().catch((err) => {
    console.error("[Seed] Failed:", err.message);
    process.exit(1);
});
