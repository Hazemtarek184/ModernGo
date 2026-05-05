import "dotenv/config.js";
import connectDB from "./DB/Connection";
import { StoreModel } from "./store/Store-Module";
import { ProductModel } from "./product/Product-Module";
import { StoreProductModel } from "./store-product/StoreProduct-Module";
import mongoose from "mongoose";
import * as fs from "fs";
import * as path from "path";
import { compressAndEncodePhoto } from "./utils/photo.utils";

// Helper: read a local image file, fake a Multer file, and compress via sharp
const compressLocalImage = async (filename: string): Promise<string> => {
    const filePath = path.join(__dirname, "seed-images", filename);
    const buffer = fs.readFileSync(filePath);
    const fakeMulterFile = {
        buffer,
        originalname: filename,
        mimetype: "image/png",
        size: buffer.length,
    } as any;
    const result = await compressAndEncodePhoto(fakeMulterFile);
    const compressedSizeKB = (result.length * 0.75 / 1024).toFixed(1);
    console.log(`  📷 ${filename}: ${(buffer.length / 1024).toFixed(1)}KB → ${compressedSizeKB}KB (compressed)`);
    return result;
};

const productsToSeed: any[] = [
    {
        name: "Organic Honeycrisp Apples",
        slug: "organic-honeycrisp-apples",
        description: "Fresh, crisp, and sweet organic apples sourced from local farms. Perfect for a healthy snack.",
        images: ["apples.png"],
        ingredients: ["100% Organic Apples"],
        nutrients: {
            calories: 95,
            sugar_g: 19,
            sodium_mg: 2,
            fat_g: 0.3
        },
        allergens: ["None"],
        mainPrice: 4.99,
        salePrice: 4.99,
        stock: 500,
        discountPercent: 0
    },
    {
        name: "Whey Protein Powder - Chocolate",
        slug: "whey-protein-chocolate",
        description: "Premium whey protein isolate. 24g of protein per serving. Fast absorbing and great tasting.",
        images: ["protein.png"],
        ingredients: ["Whey Protein Isolate", "Cocoa Powder", "Natural Flavors", "Sucralose"],
        nutrients: {
            calories: 120,
            sugar_g: 1,
            sodium_mg: 50,
            fat_g: 1.5
        },
        allergens: ["Milk", "Soy"],
        warnings: ["Consult a physician before use if pregnant or nursing."],
        mainPrice: 39.99,
        salePrice: 34.99,
        stock: 200,
        discountPercent: 12.5
    },
    {
        name: "Daily Multivitamin Gummies",
        slug: "daily-multivitamin-gummies",
        description: "Complete daily multivitamin in a delicious fruit-flavored gummy form. Supports immune health and energy.",
        images: ["vitamins.png"],
        ingredients: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin E", "Glucose Syrup", "Gelatin"],
        nutrients: {
            calories: 15,
            sugar_g: 3,
            sodium_mg: 0,
            fat_g: 0
        },
        allergens: ["None"],
        drugInteractions: ["May interact with blood thinners. Consult a doctor."],
        mainPrice: 14.99,
        salePrice: 12.99,
        stock: 150,
        discountPercent: 13
    },
    {
        name: "Wireless Noise Cancelling Headphones",
        slug: "wireless-nc-headphones",
        description: "Over-ear bluetooth headphones with active noise cancellation, 30-hour battery life, and premium sound.",
        images: ["headphones.png"],
        ingredients: [],
        nutrients: {},
        warnings: ["Do not use while driving or operating heavy machinery. Listening at high volumes can damage hearing."],
        mainPrice: 199.99,
        salePrice: 149.99,
        stock: 50,
        discountPercent: 25
    }
];

const seedProductsAndRelations = async () => {
    try {
        await connectDB();
        console.log("Starting product and relationship seeding process...");

        // 1. Fetch existing stores
        const stores = await StoreModel.find({});
        if (stores.length === 0) {
            console.error("❌ No stores found! Please run the store seeding script first.");
            process.exit(1);
        }
        console.log(`Found ${stores.length} existing stores.`);

        // For this seeding script, we'll pick the first 2 stores to assign products to.
        const targetStores = stores.slice(0, 2);

        // 2. Clear old products & relations for a clean slate
        console.log("Clearing existing products and store-products...");
        await StoreProductModel.deleteMany({});
        await ProductModel.deleteMany({});

        // 3. Create Products
        console.log(`Seeding ${productsToSeed.length} new base products...`);
        const createdProducts = [];

        for (const pData of productsToSeed) {
            // Compress product images using sharp via compressAndEncodePhoto
            if (pData.images && pData.images.length > 0) {
                const compressedImages = [];
                for (const filename of pData.images) {
                    compressedImages.push(await compressLocalImage(filename));
                }
                pData.images = compressedImages;
            }

            // Assign createdBy and updatedBy to the first store just for tracking
            pData.createdBy = targetStores[0]!._id;
            pData.updatedBy = targetStores[0]!._id;

            const product = new ProductModel(pData);
            await product.save();
            createdProducts.push(product);
        }
        console.log("✅ Base Products created successfully!");

        // 4. Create Store-Product Relations
        console.log("Mapping products to stores in StoreProduct collection...");
        let relationsCount = 0;

        for (const store of targetStores) {
            for (const product of createdProducts) {

                // Add some variation: Not all stores carry all products, or they have different prices/stock
                // Let's make store #2 slightly more expensive and have less stock
                const isStoreTwo = store._id.toString() === targetStores[1]?._id?.toString();

                // We'll skip the headphones for store 2 just to show varied inventory
                if (isStoreTwo && product.slug === "wireless-nc-headphones") {
                    continue;
                }

                const relationData = {
                    storeId: store._id,
                    productId: product._id,
                    // Store-specific pricing and stock mapping
                    price: isStoreTwo ? product.mainPrice + 2.00 : product.salePrice,
                    stock: isStoreTwo ? Math.floor(product.stock / 2) : product.stock,
                    isAvailable: true
                };

                // Use updateOne with upsert to avoid duplicate key errors on the compound index
                await StoreProductModel.updateOne(
                    { storeId: store._id, productId: product._id },
                    { $set: relationData },
                    { upsert: true }
                );
                relationsCount++;
            }
        }

        console.log(`✅ Successfully mapped ${relationsCount} Store-Product relationships!`);

    } catch (error) {
        console.error("❌ Error during product seeding:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Database connection closed.");
        process.exit(0);
    }
};

seedProductsAndRelations();
