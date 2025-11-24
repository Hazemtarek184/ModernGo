import { Response } from "express";

export const successResponse = <T = any | null>({
    res,
    message = "Done",
    statuscode = 200,
    data,
}: {
    res: Response;
    message?: string;
    statuscode?: number;
    data?: T;

}): Response => {
    return res.status(statuscode).json({ message, statuscode, data })
}