"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config.js");
var Connection_1 = require("./DB/Connection");
var Store_Module_1 = require("./store/Store-Module");
var mongoose_1 = require("mongoose");
var fs = require("fs");
var path = require("path");
var photo_utils_1 = require("./utils/photo.utils");
// Helper: read a local image file, fake a Multer file, and compress via sharp
var compressLocalImage = function (filename) { return __awaiter(void 0, void 0, void 0, function () {
    var filePath, buffer, fakeMulterFile, result, compressedSizeKB;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                filePath = path.join(__dirname, "seed-images", filename);
                buffer = fs.readFileSync(filePath);
                fakeMulterFile = {
                    buffer: buffer,
                    originalname: filename,
                    mimetype: "image/png",
                    size: buffer.length,
                };
                return [4 /*yield*/, (0, photo_utils_1.compressAndEncodePhoto)(fakeMulterFile)];
            case 1:
                result = _a.sent();
                compressedSizeKB = (result.length * 0.75 / 1024).toFixed(1);
                console.log("  \uD83D\uDCF7 ".concat(filename, ": ").concat((buffer.length / 1024).toFixed(1), "KB \u2192 ").concat(compressedSizeKB, "KB (compressed)"));
                return [2 /*return*/, result];
        }
    });
}); };
var storesToSeed = [
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
var seedDatabase = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _i, storesToSeed_1, sData, _a, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 8, 9, 11]);
                return [4 /*yield*/, (0, Connection_1.default)()];
            case 1:
                _b.sent();
                console.log("Starting database seeding process...");
                // Remove existing stores to prevent duplicates
                console.log("Clearing existing stores...");
                return [4 /*yield*/, Store_Module_1.StoreModel.deleteMany({})];
            case 2:
                _b.sent();
                // Compress store photos using sharp via compressAndEncodePhoto
                console.log("Compressing store profile photos...");
                _i = 0, storesToSeed_1 = storesToSeed;
                _b.label = 3;
            case 3:
                if (!(_i < storesToSeed_1.length)) return [3 /*break*/, 6];
                sData = storesToSeed_1[_i];
                if (!sData.profilePhoto) return [3 /*break*/, 5];
                _a = sData;
                return [4 /*yield*/, compressLocalImage(sData.profilePhoto)];
            case 4:
                _a.profilePhoto = _b.sent();
                _b.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 3];
            case 6:
                // Insert new stores (Using .create() instead of .insertMany() to trigger the 'pre-save' password hashing hooks)
                console.log("Seeding ".concat(storesToSeed.length, " stores..."));
                return [4 /*yield*/, Store_Module_1.StoreModel.create(storesToSeed)];
            case 7:
                _b.sent();
                console.log("✅ Stores seeded successfully!");
                return [3 /*break*/, 11];
            case 8:
                error_1 = _b.sent();
                console.error("❌ Error seeding the database:", error_1);
                return [3 /*break*/, 11];
            case 9: 
            // Close database connection
            return [4 /*yield*/, mongoose_1.default.disconnect()];
            case 10:
                // Close database connection
                _b.sent();
                console.log("Database connection closed.");
                process.exit(0);
                return [7 /*endfinally*/];
            case 11: return [2 /*return*/];
        }
    });
}); };
seedDatabase();
