import { z } from "zod";
import { generalFields } from "../middleware/middleware-Validation";

export const getMyCartSchema = {
    params: z.object({
        customerId: generalFields.id,
    }).optional(),
};

export const cartActionSchema = {
    body: z.object({
        storeProductId: generalFields.id,

        action: z.enum(["pick", "release"], {
            message: "Action must be either pick or release",
        }),
    }),
};