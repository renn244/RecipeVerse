import { NextFunction, Request, Response } from "express";

export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if(req.isAuthenticated()) {
        return next()
    }

    return res.status(400).json({ auth: false })
}

export const optionalAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    req.isAuthenticated()
    return next()
}