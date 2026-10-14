import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { register, login, getMe } from '../controllers/user.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = Router()

// slows down password guessing and signup spam
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Try again in a few minutes.' },
})

router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)
router.get('/me', requireAuth, getMe)

export default router