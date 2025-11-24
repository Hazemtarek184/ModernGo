"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const connectDB = async () => {
    const MONGO_URI = process.env.MONGO_CONNECTION_URI;
    if (!MONGO_URI) {
        console.error(" Missing MONGO_CONNECTION_URI environment variable");
        process.exit(1);
    }
    try {
        const result = await (0, mongoose_1.connect)(MONGO_URI, {
            serverSelectionTimeoutMS: 30000,
        });
        console.log(result.models);
        console.log(" DB Connected Successfully ✔️");
    }
    catch (error) {
        console.error(" DB Connection Failed ❌ :", error);
        process.exit(1);
    }
};
exports.default = connectDB;
//# sourceMappingURL=Connection.js.map