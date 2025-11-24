import { Response } from "express";
export declare const successResponse: <T = any | null>({ res, message, statuscode, data, }: {
    res: Response;
    message?: string;
    statuscode?: number;
    data?: T;
}) => Response;
//# sourceMappingURL=success.response.d.ts.map