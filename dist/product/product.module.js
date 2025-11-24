"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductModel = void 0;
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    name: { type: String, required: true, minlength: 2, maxlength: 2000 },
    slug: { type: String, minlength: 2, maxlength: 50 },
    description: { type: String, minlength: 2, maxlength: 5000 },
    assistFolderId: {},
    images: [{ type: String }],
    discountPercent: { type: Number, default: 0 },
    mainPrice: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    soldItems: { type: Number, default: 0 },
    stock: { type: Number, required: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    freezedAt: Date,
    freezedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    restoreAt: Date,
    restoreBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: false }
});
productSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });
exports.ProductModel = mongoose_1.models.product || (0, mongoose_1.model)("Product", productSchema);
//# sourceMappingURL=product.module.js.map