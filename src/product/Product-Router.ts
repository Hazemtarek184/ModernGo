import express from "express";
import productController from "./Product-Controller";
import { validation } from "../middleware/middleware-Validation";
import * as validators from "./Product-Validation"
import { fileUpload, fileValidation } from "../utils/cloud.multer";
import { authenticateStore } from "../middleware/auth.middleware";

const router = express.Router();

// Public routes
router.get(
  "/",
  validation(validators.getAllProductsSchema),
  productController.getAllProducts
);

// Basic CRUD operations
router.post(
  "/",
  authenticateStore,
  fileUpload({ validation: fileValidation.image }).array("images", 5),
  validation(validators.createProductSchema),
  productController.createProduct
);

router.patch(
  "/:productId",
  authenticateStore,
  validation(validators.createProductSchema),
  productController.updateProduct
);

router.patch(
  "/:productId/attachment",
  authenticateStore,
  fileUpload({ validation: fileValidation.image }).array("images", 5),
  productController.updateProductAttachment
);

router.delete(
  "/:productId/freeze",
  authenticateStore,
  productController.freezeProduct
);

router.patch(
  "/:productId/restore",
  authenticateStore,
  productController.restoreProduct
);

export default router;