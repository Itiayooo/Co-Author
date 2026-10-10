import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
    userId?: string
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Not authorized' })
        return
    }
    try {
        const payload = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET as string) as { id: string }
        req.userId = payload.id
        next()
    } catch {
        res.status(401).json({ message: 'Invalid token' })
    }
}