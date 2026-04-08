import express from "express";
import CustomerController from "./Customer-Controller";
import { validation } from "../middleware/middleware-Validation";
import * as validators from "./Customer-Validation";
import { authenticateCustomer } from "../middleware/auth.middleware";
import { cloudFileUpload, fileValidation, StorageEnum } from "../utils/cloud.multer";

const router = express.Router();

router.get(
    "/me/profile-photo",
    authenticateCustomer,
    CustomerController.getMyProfilePhoto
);

router.post(
    "/profile-photo",
    authenticateCustomer,
    cloudFileUpload({
        validation: fileValidation.image,
        storageApproach: StorageEnum.memory,
        maxSizeMB: 5
    }).single("photo"),
    CustomerController.uploadProfilePhoto
);

router.post(
    "/login",
    validation(validators.loginCustomerSchema),
    CustomerController.loginCustomer
);

router.post(
    "/register",
    validation(validators.registerCustomerSchema),
    CustomerController.registerCustomer
);

router.get(
    "/:customerId",
    authenticateCustomer,
    validation(validators.getCustomerSchema),
    CustomerController.getCustomerProfile
);

router.patch(
    "/:customerId",
    authenticateCustomer,
    validation(validators.updateCustomerSchema),
    CustomerController.updateCustomerProfile
);

router.patch(
    "/:customerId/password",
    authenticateCustomer,
    validation(validators.updatePasswordSchema),
    CustomerController.updatePassword
);

export default router;