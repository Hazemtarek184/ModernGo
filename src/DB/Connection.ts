import mongoose from 'mongoose';
import "dotenv/config.js";

const MONGOURI = process.env.MONGO_CONNECTION_URI;

export const connectDB = async () => {
    if (!MONGOURI) {
        console.error("Missing MONGO_CONNECTION_URI environment variable");
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGOURI);
        console.log("Connected to the database.");
    } catch (err) {
        console.error("Database connection error:", err);
        process.exit(1);
    }
};