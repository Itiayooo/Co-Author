import { Router } from 'express'
import {
    createDocument,
    getMyDocuments,
    getDocument,
    updateDocument,
    deleteDocument,
} from '../controllers/document.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = Router()

router.use(requireAuth)

router.post('/', createDocument)
router.get('/', getMyDocuments)
router.get('/:id', getDocument)
router.patch('/:id', updateDocument)
router.delete('/:id', deleteDocument)

export default router