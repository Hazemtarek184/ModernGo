import express from "express";
import productController from "./product.controller";
import { validation } from "../middleware/middleware.validation";
import * as validators from "./product.validation"
import { cloudFileUpload, fileValidation } from "../utils/cloud.multer";

const router = express.Router();

// Basic CRUD operations
router.post(
  "/",

  cloudFileUpload({ validation: fileValidation.image }).array("images", 5),
  validation(validators.createProductSchema),
  productController.createProduct
);


router.patch(
  "/:productId",
  validation(validators.createProductSchema),
  productController.updateProduct
);


router.patch(
  "/:productId/attachment",
  cloudFileUpload({ validation: fileValidation.image }).array("images", 5),
  productController.updateProductAttachment
);


router.delete("/:productId/freeze", productController.freezeProduct)

router.patch("/:productId/restore", productController.restoreProduct)






export default router;