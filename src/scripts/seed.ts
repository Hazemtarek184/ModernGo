/**
 * ─── Database Seed Script ────────────────────────────────────────────
 *
 * Populates the database with realistic demo data so any developer
 * who clones the repo can start working immediately.
 *
 * Usage:
 *   npm run seed
 *
 * All passwords are set to "Password123!" and are auto-hashed
 * by the Mongoose pre('save') hooks on Customer and Store models.
 * ─────────────────────────────────────────────────────────────────────
 */

import "dotenv/config";
import { connect, disconnect, Types } from "mongoose";
import { CustomerModel } from "../customer/Customer-Module";
import { StoreModel } from "../store/Store-Module";
import { ProductModel } from "../product/Product-Module";
import { StoreProductModel } from "../store-product/StoreProduct-Module";

// ─── Helpers ─────────────────────────────────────────────────────────

const log = (msg: string) => console.log(`  ${msg}`);
const header = (msg: string) => console.log(`\n🔹 ${msg}`);

const DEFAULT_PASSWORD = "Password123!";

// ─── Seed Data ───────────────────────────────────────────────────────

const customersData = [
    {
        firstName: "Ahmed",
        lastName: "Hassan",
        email: "ahmed@example.com",
        phone: "+201000000001",
        password: DEFAULT_PASSWORD,
        profilePhotoKey: "seed/customers/ahmed.jpg",
        address: {
            street: "15 Tahrir St",
            city: "Cairo",
            state: "Cairo",
            postalCode: "11511",
            country: "Egypt",
        },
    },
    {
        firstName: "Sara",
        lastName: "Mohamed",
        email: "sara@example.com",
        phone: "+201000000002",
        password: DEFAULT_PASSWORD,
        profilePhotoKey: "seed/customers/sara.jpg",
        address: {
            street: "22 Nile Corniche",
            city: "Giza",
            state: "Giza",
            postalCode: "12611",
            country: "Egypt",
        },
    },
    {
        firstName: "Omar",
        lastName: "Ali",
        email: "omar@example.com",
        phone: "+201000000003",
        password: DEFAULT_PASSWORD,
        profilePhotoKey: "seed/customers/omar.jpg",
        address: {
            street: "8 Salah Salem Rd",
            city: "Nasr City",
            state: "Cairo",
            postalCode: "11765",
            country: "Egypt",
        },
    },
];

const storesData = [
    {
        name: "Modern Go Market — Zamalek",
        email: "zamalek@moderngo.com",
        password: DEFAULT_PASSWORD,
        address: "12 July 26th St, Zamalek, Cairo",
        phone: "+201100000001",
        location: {
            type: "Point" as const,
            coordinates: [31.2194, 30.0561] as [number, number],
            address: "12 July 26th St, Zamalek, Cairo",
        },
        categories: ["snacks", "beverages", "bakery"],
    },
    {
        name: "Modern Go Express — Maadi",
        email: "maadi@moderngo.com",
        password: DEFAULT_PASSWORD,
        address: "5 Road 9, Maadi, Cairo",
        phone: "+201100000002",
        location: {
            type: "Point" as const,
            coordinates: [31.2579, 29.9602] as [number, number],
            address: "5 Road 9, Maadi, Cairo",
        },
        categories: ["snacks", "beverages"],
    },
    {
        name: "Modern Go Hub — Nasr City",
        email: "nasrcity@moderngo.com",
        password: DEFAULT_PASSWORD,
        address: "Abbas El Akkad St, Nasr City, Cairo",
        phone: "+201100000003",
        location: {
            type: "Point" as const,
            coordinates: [31.3451, 30.0511] as [number, number],
            address: "Abbas El Akkad St, Nasr City, Cairo",
        },
        categories: ["snacks", "beverages", "bakery"],
    },
];

const productsData = [
    {
        name: "Molto",
        slug: "molto",
        description: "Molto croissant — the classic Egyptian bakery snack, available in chocolate and vanilla flavors.",
        assistFolderId: "seed-folder-molto",
        images: ["seed/products/molto-1.jpg", "seed/products/molto-2.jpg"],
        mainPrice: 15,
        discountPercent: 0,
        salePrice: 15,
        stock: 200,
        soldItems: 45,
    },
    {
        name: "Chips",
        slug: "chips",
        description: "Crispy potato chips — a popular savory snack perfect for any occasion.",
        assistFolderId: "seed-folder-chips",
        images: ["seed/products/chips-1.jpg", "seed/products/chips-2.jpg"],
        mainPrice: 20,
        discountPercent: 10,
        salePrice: 18,
        stock: 350,
        soldItems: 120,
    },
    {
        name: "V-Cola",
        slug: "vcola",
        description: "V-Cola refreshing carbonated soft drink — ice cold perfection.",
        assistFolderId: "seed-folder-vcola",
        images: ["seed/products/vcola-1.jpg", "seed/products/vcola-2.jpg"],
        mainPrice: 12,
        discountPercent: 0,
        salePrice: 12,
        stock: 500,
        soldItems: 230,
    },
];

// ─── Main Seed Function ─────────────────────────────────────────────

async function seed() {
    const MONGO_URI = process.env.MONGO_CONNECTION_URI;

    if (!MONGO_URI) {
        console.error("❌ Missing MONGO_CONNECTION_URI in .env — cannot seed.");
        process.exit(1);
    }

    console.log("╔══════════════════════════════════════════════════╗");
    console.log("║         Modern Go — Database Seeder              ║");
    console.log("╚══════════════════════════════════════════════════╝");

    // ── Connect ──────────────────────────────────────────────────

    header("Connecting to MongoDB...");
    await connect(MONGO_URI, { serverSelectionTimeoutMS: 30000 });
    log("Connected ✔️");

    // ── Clear existing data ──────────────────────────────────────

    header("Clearing existing collections...");
    await StoreProductModel.deleteMany({});
    log("StoreProducts cleared");
    await ProductModel.deleteMany({});
    log("Products cleared");
    await StoreModel.deleteMany({});
    log("Stores cleared");
    await CustomerModel.deleteMany({});
    log("Customers cleared");

    // ── 1. Seed Customers ────────────────────────────────────────

    header("Seeding Customers...");
    const customers = await CustomerModel.create(customersData);
    log(`${customers.length} customers created`);

    // ── 2. Seed Stores ───────────────────────────────────────────

    header("Seeding Stores...");
    const stores = await StoreModel.create(storesData);
    log(`${stores.length} stores created`);

    // ── 3. Seed Products (createdBy = first store) ───────────────

    header("Seeding Products...");
    const productsWithCreator = productsData.map((p) => ({
        ...p,
        createdBy: stores[0]!._id,
    }));
    const products = await ProductModel.create(productsWithCreator);
    log(`${products.length} products created`);

    // ── 4. Seed StoreProducts ────────────────────────────────────

    header("Seeding StoreProducts (linking stores ↔ products)...");

    const storeProductEntries: {
        storeId: Types.ObjectId;
        productId: Types.ObjectId;
        price: number;
        stock: number;
        isAvailable: boolean;
    }[] = [];

    // Each store carries all 3 products at slightly different prices/stock
    for (const store of stores) {
        for (const product of products) {
            const priceVariation = 1 + (Math.random() * 0.2 - 0.1); // ±10%
            storeProductEntries.push({
                storeId: store._id as Types.ObjectId,
                productId: product._id as Types.ObjectId,
                price: Math.round(product.salePrice * priceVariation * 100) / 100,
                stock: Math.floor(product.stock * (0.3 + Math.random() * 0.7)),
                isAvailable: true,
            });
        }
    }

    const storeProducts = await StoreProductModel.create(storeProductEntries);
    log(`${storeProducts.length} store-product links created`);

    // ── Summary ──────────────────────────────────────────────────

    console.log("\n╔══════════════════════════════════════════════════╗");
    console.log("║               Seed Complete ✅                   ║");
    console.log("╠══════════════════════════════════════════════════╣");
    console.log(`║  Customers      │ ${String(customers.length).padStart(3)}                            ║`);
    console.log(`║  Stores         │ ${String(stores.length).padStart(3)}                            ║`);
    console.log(`║  Products       │ ${String(products.length).padStart(3)}                            ║`);
    console.log(`║  StoreProducts  │ ${String(storeProducts.length).padStart(3)}                            ║`);
    console.log("╚══════════════════════════════════════════════════╝");

    console.log("\n🔑 Login Cheat Sheet (all passwords: Password123!)");
    console.log("─────────────────────────────────────────────────");
    console.log("  Customers:");
    for (const c of customers) {
        console.log(`    • ${c.firstName} ${c.lastName}  →  ${c.email}`);
    }
    console.log("  Stores:");
    for (const s of stores) {
        console.log(`    • ${s.name}  →  ${s.email}`);
    }
    console.log("");

    // ── Disconnect ───────────────────────────────────────────────

    await disconnect();
    log("Disconnected from MongoDB. Done! 🎉\n");
}

// ─── Run ─────────────────────────────────────────────────────────────

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    disconnect().finally(() => process.exit(1));
});
