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
const Product_Controller_1 = __importDefault(require("./Product-Controller"));
const middleware_Validation_1 = require("../middleware/middleware-Validation");
const validators = __importStar(require("./Product-Validation"));
const cloud_multer_1 = require("../utils/cloud.multer");
const router = express_1.default.Router();
router.post("/", (0, cloud_multer_1.cloudFileUpload)({ validation: cloud_multer_1.fileValidation.image }).array("images", 5), (0, middleware_Validation_1.validation)(validators.createProductSchema), Product_Controller_1.default.createProduct);
router.patch("/:productId", (0, middleware_Validation_1.validation)(validators.createProductSchema), Product_Controller_1.default.updateProduct);
router.patch("/:productId/attachment", (0, cloud_multer_1.cloudFileUpload)({ validation: cloud_multer_1.fileValidation.image }).array("images", 5), Product_Controller_1.default.updateProductAttachment);
router.delete("/:productId/freeze", Product_Controller_1.default.freezeProduct);
router.patch("/:productId/restore", Product_Controller_1.default.restoreProduct);
exports.default = router;
//# sourceMappingURL=Product-Router.js.map