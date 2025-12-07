"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerModel = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const addressSchema = new mongoose_1.Schema({
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
}, { _id: false });
const customerSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true, minlength: 2, maxlength: 50 },
    lastName: { type: String, required: true, minlength: 2, maxlength: 50 },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        maxlength: 255
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 128,
        select: false
    },
    profilePhoto: {
        type: String,
        required: false
    },
    address: { type: addressSchema },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: false }
});
customerSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});
customerSchema.pre('save', async function () {
    if (!this.isModified('password'))
        return;
    const salt = await bcrypt_1.default.genSalt(10);
    this.password = await bcrypt_1.default.hash(this.password, salt);
});
customerSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt_1.default.compare(candidatePassword, this.password);
    }
    catch (error) {
        return false;
    }
};
exports.CustomerModel = mongoose_1.models.Customer || (0, mongoose_1.model)("Customer", customerSchema);
//# sourceMappingURL=Customer-Module.js.map