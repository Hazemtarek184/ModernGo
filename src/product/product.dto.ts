import { createProductSchema } from "./product.validation";
import { z } from "zod"

export type ICreateDTO = z.infer<typeof createProductSchema.body>
