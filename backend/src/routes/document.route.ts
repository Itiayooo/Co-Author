import { Router } from 'express'
import {
    createDocument,
    getMyDocuments,
    getDocument,
    updateDocument,
    deleteDocument,
    regenerateJoinCode,
    getDocumentByCode,
} from '../controllers/document.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = Router()

// public, must come before requireAuth
router.get('/join/:code', getDocumentByCode)

router.use(requireAuth)

router.post('/', createDocument)
router.get('/', getMyDocuments)
router.get('/:id', getDocument)
router.patch('/:id', updateDocument)
router.delete('/:id', deleteDocument)
router.post('/:id/regenerate-code', regenerateJoinCode)

export default router