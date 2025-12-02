import type { Request, Response } from "express";
declare class CustomerController {
    constructor();
    registerCustomer: (req: Request, res: Response) => Promise<Response>;
    loginCustomer: (req: Request, res: Response) => Promise<Response>;
    getCustomerProfile: (req: Request, res: Response) => Promise<Response>;
    updateCustomerProfile: (req: Request, res: Response) => Promise<Response>;
    updatePassword: (req: Request, res: Response) => Promise<Response>;
}
declare const _default: CustomerController;
export default _default;
//# sourceMappingURL=Customer-Controller.d.ts.map