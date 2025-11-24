import type { Request, Response, NextFunction } from "express";
export interface IError extends Error {
    statusCode: number;
}
export declare class ApplicationException extends Error {
    statusCode: number;
    constructor(message: string, statusCode?: number, cause?: unknown);
}
export declare class BadRequestException extends ApplicationException {
    constructor(message: string, cause?: unknown);
}
export declare class NotFoundException extends ApplicationException {
    constructor(message: string, cause?: unknown);
}
export declare class UnauthorizedException extends ApplicationException {
    constructor(message: string, cause?: unknown);
}
export declare class forbiddenException extends ApplicationException {
    constructor(message: string, cause?: unknown);
}
export declare class ConflictException extends ApplicationException {
    constructor(message: string, cause?: unknown);
}
export declare const globalErrorHandling: (error: IError, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
//# sourceMappingURL=error.response.d.ts.map