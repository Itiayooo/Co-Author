import http from 'http'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Server } from 'socket.io'
import { connectDB } from './config/db.js'
import userRoutes from './routes/user.route.js'
import documentRoutes from './routes/document.route.js'
import { registerDocumentSocket } from './sockets/document.socket.js'

dotenv.config()

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

const app = express()
app.use(cors({ origin: CLIENT_URL }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})
app.use('/api/users', userRoutes)
app.use('/api/documents', documentRoutes)

const server = http.createServer(app)
const io = new Server(server, { cors: { origin: CLIENT_URL } })
registerDocumentSocket(io)

const PORT = process.env.PORT || 5000

connectDB()
  .then(() => {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err)
    process.exit(1)
  })