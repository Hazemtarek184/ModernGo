import "dotenv/config.js";
import connectDB from "./DB/Connection";
import { StoreModel } from "./store/Store-Module";
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
    const compressedSizeKB = (result.length * 0.75 / 1024).toFixed(1); // base64 → actual bytes
    console.log(`  📷 ${filename}: ${(buffer.length / 1024).toFixed(1)}KB → ${compressedSizeKB}KB (compressed)`);
    return result;
};

const storesToSeed: any[] = [
    // --- Pharmacy / Health (Similar details, same city) ---
    {
        name: "Walgreens Pharmacy",
        email: "contact@walgreens.com",
        password: "Password123!",
        address: "123 Main St, Springfield",
        phone: "+1-800-925-4733",
        location: {
            type: "Point",
            coordinates: [-89.6501, 39.7817],
            address: "123 Main St, Springfield"
        },
        categories: ["Pharmacy", "Health", "Convenience"],
        profilePhoto: "walgreens.png"
    },
    {
        name: "CVS Pharmacy",
        email: "support@cvs.com",
        password: "Password123!",
        address: "125 Main St, Springfield", // Similar address
        phone: "+1-800-746-7287",
        location: {
            type: "Point",
            coordinates: [-89.6505, 39.7818], // Very close coordinates
            address: "125 Main St, Springfield"
        },
        categories: ["Pharmacy", "Health", "Convenience"],
        profilePhoto: "cvs.png"
    },

    // --- Big Box Supermarkets (Different details, different cities) ---
    {
        name: "Walmart Supercenter",
        email: "store123@walmart.com",
        password: "Password123!",
        address: "4000 Bentonville Rd, Bentonville, AR",
        phone: "+1-800-925-6278",
        location: {
            type: "Point",
            coordinates: [-94.2088, 36.3728],
            address: "4000 Bentonville Rd, Bentonville, AR"
        },
        categories: ["Supermarket", "Electronics", "Groceries", "Clothing"],
        profilePhoto: "walmart.png"
    },
    {
        name: "Target Super Target",
        email: "guest@target.com",
        password: "Password123!",
        address: "1000 Nicollet Mall, Minneapolis, MN",
        phone: "+1-800-440-0680",
        location: {
            type: "Point",
            coordinates: [-93.2755, 44.9744],
            address: "1000 Nicollet Mall, Minneapolis, MN"
        },
        categories: ["Supermarket", "Electronics", "Groceries", "Clothing"], // Similar categories to Walmart
        profilePhoto: "target.png"
    },

    // --- Wholesale Clubs ---
    {
        name: "Costco Wholesale",
        email: "membership@costco.com",
        password: "Password123!",
        address: "99 Costco Way, Issaquah, WA",
        phone: "+1-800-774-2678",
        location: {
            type: "Point",
            coordinates: [-122.0326, 47.5301],
            address: "99 Costco Way, Issaquah, WA"
        },
        categories: ["Wholesale", "Groceries", "Electronics", "Tires"],
        profilePhoto: "costco.png"
    },

    // --- Electronics (Similar details, competitors) ---
    {
        name: "Best Buy",
        email: "info@bestbuy.com",
        password: "Password123!",
        address: "7601 Penn Ave S, Richfield, MN",
        phone: "+1-888-237-8289",
        location: {
            type: "Point",
            coordinates: [-93.3039, 44.8622],
            address: "7601 Penn Ave S, Richfield, MN"
        },
        categories: ["Electronics", "Appliances", "Computers"],
        profilePhoto: "bestbuy.png"
    },
    {
        name: "Apple Store",
        email: "retail@apple.com",
        password: "Password123!",
        address: "1 Apple Park Way, Cupertino, CA",
        phone: "+1-800-692-7753",
        location: {
            type: "Point",
            coordinates: [-122.0090, 37.3349],
            address: "1 Apple Park Way, Cupertino, CA"
        },
        categories: ["Electronics", "Computers", "Mobile Phones"],
        profilePhoto: "apple.png"
    },

    // --- Home Improvement ---
    {
        name: "The Home Depot",
        email: "customer_care@homedepot.com",
        password: "Password123!",
        address: "2455 Paces Ferry Rd, Atlanta, GA",
        phone: "+1-800-466-3337",
        location: {
            type: "Point",
            coordinates: [-84.4682, 33.8643],
            address: "2455 Paces Ferry Rd, Atlanta, GA"
        },
        categories: ["Home Improvement", "Hardware", "Garden"],
        profilePhoto: "homedepot.png"
    },
    {
        name: "Lowe's Home Improvement",
        email: "support@lowes.com",
        password: "Password123!",
        address: "1000 Lowe's Blvd, Mooresville, NC",
        phone: "+1-800-445-6937",
        location: {
            type: "Point",
            coordinates: [-80.8529, 35.5414],
            address: "1000 Lowe's Blvd, Mooresville, NC"
        },
        categories: ["Home Improvement", "Hardware", "Garden"],
        profilePhoto: "lowes.png"
    },

    // --- Grocery Specific ---
    {
        name: "Whole Foods Market",
        email: "healthy@wholefoods.com",
        password: "Password123!",
        address: "550 Bowie St, Austin, TX",
        phone: "+1-512-476-1206",
        location: {
            type: "Point",
            coordinates: [-97.7533, 30.2701],
            address: "550 Bowie St, Austin, TX"
        },
        categories: ["Groceries", "Organic", "Supermarket"],
        profilePhoto: "wholefoods.png"
    },
    {
        name: "Trader Joe's",
        email: "contact@traderjoes.com",
        password: "Password123!",
        address: "800 S Shamrock Ave, Monrovia, CA",
        phone: "+1-626-599-3700",
        location: {
            type: "Point",
            coordinates: [-117.9942, 34.1350],
            address: "800 S Shamrock Ave, Monrovia, CA"
        },
        categories: ["Groceries", "Specialty", "Supermarket"],
        profilePhoto: "traderjoes.png"
    }
];

const seedDatabase = async () => {
    try {
        await connectDB();

        console.log("Starting database seeding process...");

        // Remove existing stores to prevent duplicates
        console.log("Clearing existing stores...");
        await StoreModel.deleteMany({});

        // Compress store photos using sharp via compressAndEncodePhoto
        console.log("Compressing store profile photos...");
        for (const sData of storesToSeed) {
            if (sData.profilePhoto) {
                sData.profilePhoto = await compressLocalImage(sData.profilePhoto);
            }
        }

        // Insert new stores (Using .create() instead of .insertMany() to trigger the 'pre-save' password hashing hooks)
        console.log(`Seeding ${storesToSeed.length} stores...`);
        await StoreModel.create(storesToSeed);

        console.log("✅ Stores seeded successfully!");
    } catch (error) {
        console.error("❌ Error seeding the database:", error);
    } finally {
        // Close database connection
        await mongoose.disconnect();
        console.log("Database connection closed.");
        process.exit(0);
    }
};

seedDatabase();
