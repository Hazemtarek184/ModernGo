import type { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            customer?: {
                customerId: string;
                email: string;
            };
        }
    }
}
export declare const authenticateCustomer: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.middleware.d.ts.map