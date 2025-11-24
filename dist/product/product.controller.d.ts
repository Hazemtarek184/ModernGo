import type { Request, Response } from "express";
export declare enum RoleEnum {
    admin = "admin",
    user = "user"
}
declare class ProductController {
    private productModel;
    userModel: any;
    constructor();
    createProduct: (req: Request, res: Response) => Promise<Response>;
    updateProduct: (req: Request, res: Response) => Promise<Response>;
    updateProductAttachment: (req: Request, res: Response) => Promise<Response>;
    freezeProduct: (req: Request, res: Response) => Promise<Response>;
    restoreProduct: (req: Request, res: Response) => Promise<Response>;
    hardDeleteProduct: (req: Request, res: Response) => Promise<Response>;
}
declare const _default: ProductController;
export default _default;
//# sourceMappingURL=product.controller.d.ts.map