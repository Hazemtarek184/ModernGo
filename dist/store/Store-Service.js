"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoresWithPagination = exports.checkStoreExists = exports.getStoresByIds = exports.getStoreCount = exports.findStoresByCategories = exports.findStoresByCategory = exports.searchStoresByNamePattern = exports.findStoresNearLocation = exports.deleteStoreById = exports.updateStoreById = exports.createNewStore = exports.getStoreById = exports.getAllStores = void 0;
const Store_Module_1 = require("./Store-Module");
const mongoose_1 = require("mongoose");
const getAllStores = async () => {
    return await Store_Module_1.storeModel.find().lean();
};
exports.getAllStores = getAllStores;
const getStoreById = async (storeId) => {
    return await Store_Module_1.storeModel.findById(storeId).lean();
};
exports.getStoreById = getStoreById;
const createNewStore = async (storeData) => {
    const newStore = await Store_Module_1.storeModel.create(storeData);
    return newStore.toObject();
};
exports.createNewStore = createNewStore;
const updateStoreById = async (storeId, updateData) => {
    return await Store_Module_1.storeModel.findByIdAndUpdate(storeId, updateData, { new: true, runValidators: true }).lean();
};
exports.updateStoreById = updateStoreById;
const deleteStoreById = async (storeId) => {
    return await Store_Module_1.storeModel.findByIdAndDelete(storeId).lean();
};
exports.deleteStoreById = deleteStoreById;
const findStoresNearLocation = async (longitude, latitude, maxDistance = 5000) => {
    return await Store_Module_1.storeModel.find({
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [longitude, latitude]
                },
                $maxDistance: maxDistance
            }
        }
    }).lean();
};
exports.findStoresNearLocation = findStoresNearLocation;
const searchStoresByNamePattern = async (searchQuery) => {
    return await Store_Module_1.storeModel.find({
        name: { $regex: searchQuery, $options: 'i' }
    }).lean();
};
exports.searchStoresByNamePattern = searchStoresByNamePattern;
const findStoresByCategory = async (category) => {
    return await Store_Module_1.storeModel.find({
        categories: category
    }).lean();
};
exports.findStoresByCategory = findStoresByCategory;
const findStoresByCategories = async (categories) => {
    return await Store_Module_1.storeModel.find({
        categories: { $in: categories }
    }).lean();
};
exports.findStoresByCategories = findStoresByCategories;
const getStoreCount = async () => {
    return await Store_Module_1.storeModel.countDocuments();
};
exports.getStoreCount = getStoreCount;
const getStoresByIds = async (storeIds) => {
    const objectIds = storeIds.map(id => new mongoose_1.Types.ObjectId(id));
    return await Store_Module_1.storeModel.find({
        _id: { $in: objectIds }
    }).lean();
};
exports.getStoresByIds = getStoresByIds;
const checkStoreExists = async (storeId) => {
    const count = await Store_Module_1.storeModel.countDocuments({ _id: storeId });
    return count > 0;
};
exports.checkStoreExists = checkStoreExists;
const getStoresWithPagination = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const [stores, total] = await Promise.all([
        Store_Module_1.storeModel.find().skip(skip).limit(limit).lean(),
        Store_Module_1.storeModel.countDocuments()
    ]);
    return {
        stores,
        total,
        page,
        pages: Math.ceil(total / limit)
    };
};
exports.getStoresWithPagination = getStoresWithPagination;
//# sourceMappingURL=Store-Service.js.map