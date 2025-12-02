import type { Request, Response } from "express";
declare class StoreProductController {
    constructor();
    addProductToStore: (req: Request, res: Response) => Promise<Response>;
    getStoreProducts: (req: Request, res: Response) => Promise<Response>;
    getProductStores: (req: Request, res: Response) => Promise<Response>;
    updateStoreProduct: (req: Request, res: Response) => Promise<Response>;
    removeProductFromStore: (req: Request, res: Response) => Promise<Response>;
}
declare const _default: StoreProductController;
export default _default;
//# sourceMappingURL=StoreProduct-Controller.d.ts.map