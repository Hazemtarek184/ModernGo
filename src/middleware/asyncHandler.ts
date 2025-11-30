import { Request, Response, NextFunction } from 'express';

type AsyncRequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<any>;

/**
 * Async handler wrapper to catch errors from async route handlers
 * and pass them to Express error handling middleware
 */
export const asyncHandler = (fn: AsyncRequestHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
