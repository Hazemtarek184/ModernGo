/**
 * ============================================================
 *  ModernGo — All-in-one Database Seed Script
 * ============================================================
 *  Runs in order:
 *    1. Stores
 *    2. Products + StoreProducts (linked to the first 2 stores)
 *    3. Test customer  (email: test@test.com / password: test)
 *    4. Orders         (500 fake orders over the last 90 days)
 *
 *  Usage:
 *    npm run seed
 *
 *  Options (env vars):
 *    SEED_ORDERS=500        number of fake orders to generate (default 500)
 *    SEED_DAYS=90           days of history to spread orders over (default 90)
 * ============================================================
 */

import "dotenv/config.js";
import * as fs from "fs";
import * as path from "path";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

import connectDB from "./DB/Connection";
import { StoreModel } from "./store/Store-Module";
import { ProductModel } from "./product/Product-Module";
import { StoreProductModel } from "./store-product/StoreProduct-Module";
import { CustomerModel } from "./customer/Customer-Module";
import { OrderModel } from "./order/Order-Module";
import { compressAndEncodePhoto } from "./utils/photo.utils";

// ─── Config ──────────────────────────────────────────────────────────────────
const NUM_ORDERS  = parseInt(process.env.SEED_ORDERS ?? "500");
const DAYS_HISTORY = parseInt(process.env.SEED_DAYS ?? "90");

// ─── Helpers ─────────────────────────────────────────────────────────────────
const log = {
    step: (msg: string) => console.log(`\n${"─".repeat(55)}\n  ${msg}\n${"─".repeat(55)}`),
    ok:   (msg: string) => console.log(`  ✅  ${msg}`),
    info: (msg: string) => console.log(`  ℹ️   ${msg}`),
    warn: (msg: string) => console.log(`  ⚠️   ${msg}`),
};

async function compressLocalImage(filename: string): Promise<string> {
    const filePath = path.join(__dirname, "seed-images", filename);
    const buffer = fs.readFileSync(filePath);
    const fakeFile = { buffer, originalname: filename, mimetype: "image/png", size: buffer.length } as any;
    const result = await compressAndEncodePhoto(fakeFile);
    const kb = (result.length * 0.75 / 1024).toFixed(1);
    console.log(`       📷 ${filename}: ${(buffer.length / 1024).toFixed(1)}KB → ${kb}KB`);
    return result;
}

// ─── 1. Stores ───────────────────────────────────────────────────────────────
const STORES_DATA: any[] = [
    {
        name: "Walgreens Pharmacy",
        email: "contact@walgreens.com",
        password: "Password123!",
        address: "123 Main St, Springfield",
        phone: "+1-800-925-4733",
        location: { type: "Point", coordinates: [-89.6501, 39.7817], address: "123 Main St, Springfield" },
        categories: ["Pharmacy", "Health", "Convenience"],
        profilePhoto: "walgreens.png",
    },
    {
        name: "CVS Pharmacy",
        email: "support@cvs.com",
        password: "Password123!",
        address: "125 Main St, Springfield",
        phone: "+1-800-746-7287",
        location: { type: "Point", coordinates: [-89.6505, 39.7818], address: "125 Main St, Springfield" },
        categories: ["Pharmacy", "Health", "Convenience"],
        profilePhoto: "cvs.png",
    },
    {
        name: "Walmart Supercenter",
        email: "store123@walmart.com",
        password: "Password123!",
        address: "4000 Bentonville Rd, Bentonville, AR",
        phone: "+1-800-925-6278",
        location: { type: "Point", coordinates: [-94.2088, 36.3728], address: "4000 Bentonville Rd, Bentonville, AR" },
        categories: ["Supermarket", "Electronics", "Groceries", "Clothing"],
        profilePhoto: "walmart.png",
    },
    {
        name: "Target Super Target",
        email: "guest@target.com",
        password: "Password123!",
        address: "1000 Nicollet Mall, Minneapolis, MN",
        phone: "+1-800-440-0680",
        location: { type: "Point", coordinates: [-93.2755, 44.9744], address: "1000 Nicollet Mall, Minneapolis, MN" },
        categories: ["Supermarket", "Electronics", "Groceries", "Clothing"],
        profilePhoto: "target.png",
    },
    {
        name: "Costco Wholesale",
        email: "membership@costco.com",
        password: "Password123!",
        address: "99 Costco Way, Issaquah, WA",
        phone: "+1-800-774-2678",
        location: { type: "Point", coordinates: [-122.0326, 47.5301], address: "99 Costco Way, Issaquah, WA" },
        categories: ["Wholesale", "Groceries", "Electronics", "Tires"],
        profilePhoto: "costco.png",
    },
    {
        name: "Best Buy",
        email: "info@bestbuy.com",
        password: "Password123!",
        address: "7601 Penn Ave S, Richfield, MN",
        phone: "+1-888-237-8289",
        location: { type: "Point", coordinates: [-93.3039, 44.8622], address: "7601 Penn Ave S, Richfield, MN" },
        categories: ["Electronics", "Appliances", "Computers"],
        profilePhoto: "bestbuy.png",
    },
    {
        name: "Apple Store",
        email: "retail@apple.com",
        password: "Password123!",
        address: "1 Apple Park Way, Cupertino, CA",
        phone: "+1-800-692-7753",
        location: { type: "Point", coordinates: [-122.009, 37.3349], address: "1 Apple Park Way, Cupertino, CA" },
        categories: ["Electronics", "Computers", "Mobile Phones"],
        profilePhoto: "apple.png",
    },
    {
        name: "The Home Depot",
        email: "customer_care@homedepot.com",
        password: "Password123!",
        address: "2455 Paces Ferry Rd, Atlanta, GA",
        phone: "+1-800-466-3337",
        location: { type: "Point", coordinates: [-84.4682, 33.8643], address: "2455 Paces Ferry Rd, Atlanta, GA" },
        categories: ["Home Improvement", "Hardware", "Garden"],
        profilePhoto: "homedepot.png",
    },
    {
        name: "Lowe's Home Improvement",
        email: "support@lowes.com",
        password: "Password123!",
        address: "1000 Lowe's Blvd, Mooresville, NC",
        phone: "+1-800-445-6937",
        location: { type: "Point", coordinates: [-80.8529, 35.5414], address: "1000 Lowe's Blvd, Mooresville, NC" },
        categories: ["Home Improvement", "Hardware", "Garden"],
        profilePhoto: "lowes.png",
    },
    {
        name: "Whole Foods Market",
        email: "healthy@wholefoods.com",
        password: "Password123!",
        address: "550 Bowie St, Austin, TX",
        phone: "+1-512-476-1206",
        location: { type: "Point", coordinates: [-97.7533, 30.2701], address: "550 Bowie St, Austin, TX" },
        categories: ["Groceries", "Organic", "Supermarket"],
        profilePhoto: "wholefoods.png",
    },
    {
        name: "Trader Joe's",
        email: "contact@traderjoes.com",
        password: "Password123!",
        address: "800 S Shamrock Ave, Monrovia, CA",
        phone: "+1-626-599-3700",
        location: { type: "Point", coordinates: [-117.9942, 34.135], address: "800 S Shamrock Ave, Monrovia, CA" },
        categories: ["Groceries", "Specialty", "Supermarket"],
        profilePhoto: "traderjoes.png",
    },
];

// ─── 2. Products ──────────────────────────────────────────────────────────────
const PRODUCTS_DATA: any[] = [
    {
        name: "Organic Honeycrisp Apples",
        slug: "organic-honeycrisp-apples",
        description: "Fresh, crisp, and sweet organic apples sourced from local farms. Perfect for a healthy snack.",
        images: ["apples.png"],
        ingredients: ["100% Organic Apples"],
        nutrients: { calories: 95, sugar_g: 19, sodium_mg: 2, fat_g: 0.3 },
        allergens: ["None"],
        mainPrice: 4.99, salePrice: 4.99, stock: 500, discountPercent: 0,
    },
    {
        name: "Whey Protein Powder - Chocolate",
        slug: "whey-protein-chocolate",
        description: "Premium whey protein isolate. 24g of protein per serving. Fast absorbing and great tasting.",
        images: ["protein.png"],
        ingredients: ["Whey Protein Isolate", "Cocoa Powder", "Natural Flavors", "Sucralose"],
        nutrients: { calories: 120, sugar_g: 1, sodium_mg: 50, fat_g: 1.5 },
        allergens: ["Milk", "Soy"],
        warnings: ["Consult a physician before use if pregnant or nursing."],
        mainPrice: 39.99, salePrice: 34.99, stock: 200, discountPercent: 12.5,
    },
    {
        name: "Daily Multivitamin Gummies",
        slug: "daily-multivitamin-gummies",
        description: "Complete daily multivitamin in a delicious fruit-flavored gummy form. Supports immune health and energy.",
        images: ["vitamins.png"],
        ingredients: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin E", "Glucose Syrup", "Gelatin"],
        nutrients: { calories: 15, sugar_g: 3, sodium_mg: 0, fat_g: 0 },
        allergens: ["None"],
        drugInteractions: ["May interact with blood thinners. Consult a doctor."],
        mainPrice: 14.99, salePrice: 12.99, stock: 150, discountPercent: 13,
    },
    {
        name: "Wireless Noise Cancelling Headphones",
        slug: "wireless-nc-headphones",
        description: "Over-ear bluetooth headphones with active noise cancellation, 30-hour battery life, and premium sound.",
        images: ["headphones.png"],
        ingredients: [], nutrients: {},
        warnings: ["Do not use while driving. Listening at high volumes can damage hearing."],
        mainPrice: 199.99, salePrice: 149.99, stock: 50, discountPercent: 25,
    },
];

// ─── Seed functions ───────────────────────────────────────────────────────────

async function seedStores(): Promise<any[]> {
    log.step("STEP 1/4 — Stores");

    console.log("  Clearing existing stores...");
    await StoreModel.deleteMany({});

    console.log("  Compressing store photos...");
    for (const s of STORES_DATA) {
        if (s.profilePhoto) s.profilePhoto = await compressLocalImage(s.profilePhoto);
    }

    const stores = await StoreModel.create(STORES_DATA);
    log.ok(`Created ${stores.length} stores`);
    return stores;
}

async function seedProducts(stores: any[]): Promise<{ products: any[]; storeProducts: any[] }> {
    log.step("STEP 2/4 — Products & StoreProducts");

    // Assign ALL stores products (not just the first 2 like the old script)
    const targetStores = stores;

    console.log("  Clearing existing products and store-products...");
    await StoreProductModel.deleteMany({});
    await ProductModel.deleteMany({});

    console.log("  Compressing product images...");
    const createdProducts: any[] = [];
    for (const pData of PRODUCTS_DATA) {
        const data = { ...pData };
        if (data.images?.length) {
            data.images = await Promise.all(data.images.map((f: string) => compressLocalImage(f)));
        }
        data.createdBy = targetStores[0]._id;
        data.updatedBy = targetStores[0]._id;
        const product = await new ProductModel(data).save();
        createdProducts.push(product);
    }
    log.ok(`Created ${createdProducts.length} base products`);

    console.log("  Mapping products to stores...");
    const storeProducts: any[] = [];
    for (const store of targetStores) {
        for (const product of createdProducts) {
            // Headphones only available in electronics stores
            const isElectronicsStore = store.categories?.some((c: string) =>
                ["Electronics", "Appliances", "Computers", "Mobile Phones"].includes(c)
            );
            if (product.slug === "wireless-nc-headphones" && !isElectronicsStore) continue;

            // Pharmacy/health products more expensive in general stores
            const isPharmacy = store.categories?.includes("Pharmacy");
            const priceMod = isPharmacy ? 0 : 1.10; // 10% markup in non-pharmacy stores
            const price = parseFloat((product.salePrice * priceMod).toFixed(2));

            const sp = await StoreProductModel.findOneAndUpdate(
                { storeId: store._id, productId: product._id },
                { $set: { storeId: store._id, productId: product._id, price, stock: product.stock, isAvailable: true } },
                { upsert: true, new: true }
            );
            if (sp) storeProducts.push(sp);
        }
    }
    log.ok(`Created ${storeProducts.length} store-product links`);
    return { products: createdProducts, storeProducts };
}

async function seedCustomer(): Promise<any[]> {
    log.step("STEP 3/4 — Test Customer");

    const email = "test@test.com";
    const existing = await CustomerModel.findOne({ email }).lean();
    if (existing) {
        log.warn(`Test customer already exists (${existing._id}) — skipping`);
        return [existing];
    }

    const password = await bcrypt.hash("test", 10);
    const result = await CustomerModel.collection.insertOne({
        firstName: "Test",
        lastName: "User",
        email,
        phone: "01000000000",
        password,
        address: { street: "123 Test St", city: "Cairo", state: "Cairo Governorate", postalCode: "12345", country: "Egypt" },
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    log.ok(`Test customer created: ${result.insertedId}`);
    log.info("Email: test@test.com  /  Password: test");
    return [{ _id: result.insertedId }];
}

async function seedOrders(stores: any[], storeProducts: any[], customers: any[]): Promise<void> {
    log.step(`STEP 4/4 — Orders (${NUM_ORDERS} orders over ${DAYS_HISTORY} days)`);

    await OrderModel.deleteMany({});

    // Group storeProducts by store
    const productsByStore: Record<string, any[]> = {};
    for (const sp of storeProducts) {
        const sid = sp.storeId.toString();
        if (!productsByStore[sid]) productsByStore[sid] = [];
        productsByStore[sid].push(sp);
    }

    const storesWithProducts = stores.filter(s => (productsByStore[s._id.toString()]?.length ?? 0) > 0);
    if (storesWithProducts.length === 0) {
        log.warn("No stores have products — skipping orders");
        return;
    }

    const now = Date.now();
    const past = now - DAYS_HISTORY * 24 * 60 * 60 * 1000;
    const ordersToInsert: any[] = [];

    for (let i = 0; i < NUM_ORDERS; i++) {
        const store = storesWithProducts[Math.floor(Math.random() * storesWithProducts.length)];
        if (!store?._id) continue;

        const available = productsByStore[store._id.toString()];
        if (!available?.length) continue;

        // 20% chance of being a guest/phantom order
        let customerId: any = undefined;
        if (customers.length > 0 && Math.random() > 0.2) {
            const c = customers[Math.floor(Math.random() * customers.length)];
            if (c?._id) customerId = c._id;
        }

        const numItems = Math.floor(Math.random() * 5) + 1;
        const items: any[] = [];
        let totalAmount = 0;

        for (let j = 0; j < numItems; j++) {
            const sp = available[Math.floor(Math.random() * available.length)];
            if (!sp?._id) continue;
            if (items.some(it => it.storeProductId.toString() === sp._id.toString())) continue;

            const quantity = Math.floor(Math.random() * 3) + 1;
            const price = sp.price || 10;
            items.push({ storeProductId: sp._id, quantity, price });
            totalAmount += quantity * price;
        }

        if (items.length === 0) continue;

        const randomDate = new Date(past + Math.random() * (now - past));
        const orderDoc: any = {
            storeId: store._id,
            items,
            totalAmount: parseFloat(totalAmount.toFixed(2)),
            status: Math.random() > 0.05 ? "completed" : "cancelled",
            createdAt: randomDate,
            updatedAt: randomDate,
        };
        if (customerId) orderDoc.customerId = customerId;
        ordersToInsert.push(orderDoc);
    }

    if (ordersToInsert.length > 0) {
        await OrderModel.collection.insertMany(ordersToInsert);
    }

    log.ok(`Inserted ${ordersToInsert.length} orders`);

    // Summary per store
    const counts: Record<string, number> = {};
    for (const o of ordersToInsert) counts[o.storeId.toString()] = (counts[o.storeId.toString()] || 0) + 1;
    console.log("\n  📊 Orders per storeId:");
    for (const [sid, count] of Object.entries(counts)) {
        console.log(`     ${sid}  →  ${count} orders`);
    }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
    console.log("\n╔══════════════════════════════════════════════════════╗");
    console.log("║          ModernGo — Full Database Seed               ║");
    console.log("╚══════════════════════════════════════════════════════╝");

    await connectDB();

    try {
        const stores       = await seedStores();
        const { storeProducts } = await seedProducts(stores);
        const customers    = await seedCustomer();
        await seedOrders(stores, storeProducts, customers);

        console.log("\n╔══════════════════════════════════════════════════════╗");
        console.log("║  🎉  All done! Database seeded successfully.         ║");
        console.log("╚══════════════════════════════════════════════════════╝\n");
        console.log("  Store login:     Password123!");
        console.log("  Customer login:  test@test.com / test\n");
    } catch (err) {
        console.error("\n❌ Seed failed:", err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

main();
