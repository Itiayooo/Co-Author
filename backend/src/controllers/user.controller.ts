import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'
import { AuthRequest } from '../middleware/auth.middleware.js'

const signToken = (id: string) =>
    jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '7d' })

export const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
        res.status(400).json({ message: 'All fields are required' })
        return
    }
    const exists = await User.findOne({ email })
    if (exists) {
        res.status(409).json({ message: 'Email already in use' })
        return
    }
    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hashed })
    res.status(201).json({
        token: signToken(user.id),
        user: { id: user.id, name: user.name, email: user.email },
    })
}

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json({ message: 'Invalid email or password' })
        return
    }
    res.json({
        token: signToken(user.id),
        user: { id: user.id, name: user.name, email: user.email },
    })
}

export const getMe = async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.userId)
    if (!user) {
        res.status(404).json({ message: 'User not found' })
        return
    }
    res.json({ user: { id: user.id, name: user.name, email: user.email } })
}