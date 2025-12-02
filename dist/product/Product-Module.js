"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductModel = void 0;
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    name: { type: String, required: true, minlength: 2, maxlength: 2000 },
    slug: { type: String, minlength: 2, maxlength: 50, required: true },
    description: { type: String, minlength: 2, maxlength: 5000, required: true },
    assistFolderId: { type: String, required: true },
    images: [{ type: String }],
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    mainPrice: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, required: true, min: 0 },
    soldItems: { type: Number, default: 0 },
    stock: { type: Number, required: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    freezedAt: Date,
    freezedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    restoredAt: Date,
    restoredBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: false }
});
exports.ProductModel = mongoose_1.models.Product || (0, mongoose_1.model)("Product", productSchema);
//# sourceMappingURL=Product-Module.js.map