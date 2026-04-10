import express from "express";
import productController from "./Product-Controller";
import { validation } from "../middleware/middleware-Validation";
import * as validators from "./Product-Validation";
import { cloudFileUpload, fileValidation } from "../utils/cloud.multer";
import { authenticateStore } from "../middleware/auth.middleware";

const router = express.Router();

router.post(
  "/",
  authenticateStore,
  validation(validators.createProductSchema),
  productController.createProduct
);

router.post(
  "/:productId/images",
  authenticateStore,
  cloudFileUpload({ validation: fileValidation.image }).array("images", 5),
  productController.uploadProductImages
);

router.get(
  "/:productId/images/:index",
  productController.getProductImage
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
  cloudFileUpload({ validation: fileValidation.image }).array("images", 5),
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