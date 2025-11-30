import { createProductSchema } from "./Product-Validation";
import { z } from "zod"

export type ICreateDTO = z.infer<typeof createProductSchema.body>
