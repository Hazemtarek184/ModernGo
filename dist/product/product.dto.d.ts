import { createProductSchema, freezeAccount, hardDeleteAccount, restoreAccount } from "./product.validation";
import { z } from "zod";
export type ICreateDTO = z.infer<typeof createProductSchema.body>;
export type IFreezeAccountDTO = z.infer<typeof freezeAccount.params>;
export type IRestoreAccountDTO = z.infer<typeof restoreAccount.params>;
export type IHardDeleteAccountDTO = z.infer<typeof hardDeleteAccount.params>;
//# sourceMappingURL=product.dto.d.ts.map