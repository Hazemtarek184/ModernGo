"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreProductModel = void 0;
const mongoose_1 = require("mongoose");
const storeProductSchema = new mongoose_1.Schema({
    storeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Store",
        required: true,
    },
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: [0, "Price cannot be negative"],
    },
    stock: {
        type: Number,
        required: true,
        min: [0, "Stock cannot be negative"],
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: false },
});
storeProductSchema.index({ storeId: 1, productId: 1 }, { unique: true });
storeProductSchema.index({ storeId: 1 });
storeProductSchema.index({ productId: 1 });
storeProductSchema.index({ isAvailable: 1 });
exports.StoreProductModel = mongoose_1.models.StoreProduct || (0, mongoose_1.model)("StoreProduct", storeProductSchema);
//# sourceMappingURL=StoreProduct-Module.js.map