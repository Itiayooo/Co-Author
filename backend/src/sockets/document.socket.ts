import { Server } from 'socket.io'
import * as Y from 'yjs'
import { isValidObjectId } from 'mongoose'
import jwt from 'jsonwebtoken'
import { Document } from '../models/document.model.js'

const SAVE_DELAY_MS = 2000

interface JoinPayload {
    docId: string
    clientId: number
    token?: string
    joinCode?: string
}

async function checkAccess({ docId, token, joinCode }: JoinPayload) {
    if (!isValidObjectId(docId)) return 'denied'

    const record = await Document.findById(docId).select('owner joinCode joinMode')
    if (!record) return 'denied'

    if (token) {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string }
            if (record.owner.toString() === payload.id) return 'allowed'
        } catch {
            // Invalid token; fall through to the join code check.
        }
    }

    if (joinCode && joinCode === record.joinCode) {
        return record.joinMode === 'open' ? 'allowed' : 'approval'
    }

    return 'denied'
}

const docs = new Map<string, Promise<Y.Doc | null>>()
const saveTimers = new Map<string, NodeJS.Timeout>()

async function saveNow(id: string, ydoc: Y.Doc) {
    clearTimeout(saveTimers.get(id))
    saveTimers.delete(id)

    await Document.findByIdAndUpdate(id, {
        state: Buffer.from(Y.encodeStateAsUpdate(ydoc)),
    })
}

function scheduleSave(id: string, ydoc: Y.Doc) {
    clearTimeout(saveTimers.get(id))
    saveTimers.set(
        id,
        setTimeout(() => {
            saveNow(id, ydoc).catch((err) => console.error('Save failed:', err))
        }, SAVE_DELAY_MS)
    )
}

function loadDoc(id: string) {
    let pending = docs.get(id)

    if (!pending) {
        pending = (async () => {
            if (!isValidObjectId(id)) return null

            const record = await Document.findById(id).select('state')
            if (!record) return null

            const ydoc = new Y.Doc()
            if (record.state) Y.applyUpdate(ydoc, new Uint8Array(record.state))

            ydoc.on('update', () => scheduleSave(id, ydoc))
            return ydoc
        })()

        docs.set(id, pending)

        pending.then((ydoc) => {
            if (!ydoc) docs.delete(id)
        })
    }

    return pending
}

async function unloadIfEmpty(io: Server, id: string) {
    const ydoc = await docs.get(id)
    if (!ydoc) return

    await saveNow(id, ydoc)

    if (!io.sockets.adapter.rooms.get(id)?.size) docs.delete(id)
}

export function registerDocumentSocket(io: Server) {
    io.on('connection', (socket) => {
        const clientIds = new Map<string, number>()

        socket.on('join', async (payload: JoinPayload) => {
            const { docId, clientId } = payload

            const access = await checkAccess(payload)

            if (access === 'denied') {
                socket.emit('doc-error', 'You do not have access to this document')
                return
            }

            if (access === 'approval') {
                // Placeholder until the approval flow is built.
                socket.emit('doc-error', 'The owner needs to approve guests for this document')
                return
            }

            const ydoc = await loadDoc(docId)

            if (!ydoc) {
                socket.emit('doc-error', 'Document not found')
                return
            }

            socket.join(docId)
            clientIds.set(docId, clientId)
            socket.emit('sync', Y.encodeStateAsUpdate(ydoc))
            socket.to(docId).emit('peer-joined')
        })

        socket.on('update', async (docId: string, update: Uint8Array) => {
            if (!socket.rooms.has(docId)) return

            const ydoc = await loadDoc(docId)
            if (!ydoc) return

            Y.applyUpdate(ydoc, new Uint8Array(update))
            socket.to(docId).emit('update', update)
        })

        socket.on('awareness', (docId: string, update: Uint8Array) => {
            if (!socket.rooms.has(docId)) return

            socket.to(docId).emit('awareness', update)
        })

        socket.on('disconnect', () => {
            clientIds.forEach((clientId, docId) => {
                io.to(docId).emit('peer-left', clientId)

                if (!io.sockets.adapter.rooms.get(docId)?.size) {
                    unloadIfEmpty(io, docId).catch((err) =>
                        console.error('Unload failed:', err)
                    )
                }
            })
        })
    })
}