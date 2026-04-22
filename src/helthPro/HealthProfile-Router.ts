import express from "express";
import HealthProfileController from "./HealthProfile-Controller";
import { authenticateCustomer } from "../middleware/auth.middleware";
import { validation } from "../middleware/middleware-Validation";
import * as validators from "./HealthProfile-Validation";

const router = express.Router();

router.post(
    "/",
    authenticateCustomer,
    validation(validators.createHealthProfileSchema),
    HealthProfileController.create
);

router.get(
    "/me",
    authenticateCustomer,
    HealthProfileController.getMyProfile
);

router.patch(
    "/me",
    authenticateCustomer,
    validation(validators.updateHealthProfileSchema),
    HealthProfileController.update
);

router.delete(
    "/me",
    authenticateCustomer,
    HealthProfileController.delete
);

export default router;