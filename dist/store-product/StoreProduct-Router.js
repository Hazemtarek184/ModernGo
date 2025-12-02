"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const StoreProduct_Controller_1 = __importDefault(require("./StoreProduct-Controller"));
const middleware_Validation_1 = require("../middleware/middleware-Validation");
const asyncHandler_1 = require("../middleware/asyncHandler");
const validators = __importStar(require("./StoreProduct-Validation"));
const router = express_1.default.Router();
router.post("/stores/:storeId/products", (0, middleware_Validation_1.validation)(validators.addProductToStoreSchema), (0, asyncHandler_1.asyncHandler)(StoreProduct_Controller_1.default.addProductToStore));
router.get("/stores/:storeId/products", (0, middleware_Validation_1.validation)(validators.getStoreProductsSchema), (0, asyncHandler_1.asyncHandler)(StoreProduct_Controller_1.default.getStoreProducts));
router.get("/products/:productId/stores", (0, middleware_Validation_1.validation)(validators.getProductStoresSchema), (0, asyncHandler_1.asyncHandler)(StoreProduct_Controller_1.default.getProductStores));
router.patch("/stores/:storeId/products/:productId", (0, middleware_Validation_1.validation)(validators.updateStoreProductSchema), (0, asyncHandler_1.asyncHandler)(StoreProduct_Controller_1.default.updateStoreProduct));
router.delete("/stores/:storeId/products/:productId", (0, middleware_Validation_1.validation)(validators.removeProductFromStoreSchema), (0, asyncHandler_1.asyncHandler)(StoreProduct_Controller_1.default.removeProductFromStore));
exports.default = router;
//# sourceMappingURL=StoreProduct-Router.js.map