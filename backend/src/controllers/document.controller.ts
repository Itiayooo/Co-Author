import { Request, Response } from 'express'
import { isValidObjectId } from 'mongoose'
import { Document } from '../models/document.model.js'
import { AuthRequest } from '../middleware/auth.middleware.js'
import { generateJoinCode } from '../utils/code.util.js'

const toDto = (doc: InstanceType<typeof Document>) => ({
    id: doc.id,
    title: doc.title,
    joinCode: doc.joinCode,
    joinMode: doc.joinMode,
    createdAt: doc.get('createdAt'),
    updatedAt: doc.get('updatedAt'),
})

export const createDocument = async (req: AuthRequest, res: Response) => {
    const title = req.body.title?.trim() || 'Untitled doc'

    for (let attempt = 0; attempt < 5; attempt++) {
        try {
            const doc = await Document.create({
                title,
                owner: req.userId,
                joinCode: generateJoinCode(),
            })
            res.status(201).json({ document: toDto(doc) })
            return
        } catch (err: any) {
            if (err.code !== 11000) throw err // only retry on duplicate join code
        }
    }
    res.status(500).json({ message: 'Could not generate a unique join code' })
}

export const getMyDocuments = async (req: AuthRequest, res: Response) => {
    const docs = await Document.find({ owner: req.userId }).sort({ updatedAt: -1 })
    res.json({ documents: docs.map(toDto) })
}

export const getDocument = async (req: AuthRequest, res: Response) => {
    const id = req.params.id
    if (!isValidObjectId(id)) {
        res.status(404).json({ message: 'Document not found' })
        return
    }
    const doc = await Document.findOne({ _id: id, owner: req.userId })
    if (!doc) {
        res.status(404).json({ message: 'Document not found' })
        return
    }
    res.json({ document: toDto(doc) })
}

export const updateDocument = async (req: AuthRequest, res: Response) => {
    const id = req.params.id
    if (!isValidObjectId(id)) {
        res.status(404).json({ message: 'Document not found' })
        return
    }
    const doc = await Document.findOne({ _id: id, owner: req.userId })
    if (!doc) {
        res.status(404).json({ message: 'Document not found' })
        return
    }

    const { title, joinMode } = req.body
    if (typeof title === 'string' && title.trim()) doc.title = title.trim()
    if (joinMode === 'open' || joinMode === 'approval') doc.joinMode = joinMode

    await doc.save()
    res.json({ document: toDto(doc) })
}

export const deleteDocument = async (req: AuthRequest, res: Response) => {
    const id = req.params.id
    if (!isValidObjectId(id)) {
        res.status(404).json({ message: 'Document not found' })
        return
    }
    const doc = await Document.findOneAndDelete({ _id: id, owner: req.userId })
    if (!doc) {
        res.status(404).json({ message: 'Document not found' })
        return
    }
    res.json({ message: 'Document deleted' })
}

export const regenerateJoinCode = async (req: AuthRequest, res: Response) => {
    const id = req.params.id
    if (!isValidObjectId(id)) {
        res.status(404).json({ message: 'Document not found' })
        return
    }
    const doc = await Document.findOne({ _id: id, owner: req.userId })
    if (!doc) {
        res.status(404).json({ message: 'Document not found' })
        return
    }

    for (let attempt = 0; attempt < 5; attempt++) {
        try {
            doc.joinCode = generateJoinCode()
            await doc.save()
            res.json({ document: toDto(doc) })
            return
        } catch (err: any) {
            if (err.code !== 11000) throw err
        }
    }
    res.status(500).json({ message: 'Could not generate a unique join code' })
}

export const getDocumentByCode = async (req: Request, res: Response) => {
    const code = String(req.params.code).toUpperCase()
    const doc = await Document.findOne({ joinCode: code })
    if (!doc) {
        res.status(404).json({ message: 'Invalid or expired code' })
        return
    }
    res.json({ document: { id: doc.id, title: doc.title, joinMode: doc.joinMode } })
}