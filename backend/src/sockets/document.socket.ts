import { Server, Socket } from 'socket.io'
import * as Y from 'yjs'
import jwt from 'jsonwebtoken'
import { isValidObjectId } from 'mongoose'
import { Document } from '../models/document.model.js'

const SAVE_DELAY_MS = 2000

const docs = new Map<string, Promise<Y.Doc | null>>()
const saveTimers = new Map<string, NodeJS.Timeout>()

// docId -> (guest socket id -> guest info)
interface PendingGuest {
    name: string
    clientId: number
}
const pendingGuests = new Map<string, Map<string, PendingGuest>>()

interface JoinPayload {
    docId: string
    clientId: number
    name?: string
    token?: string
    joinCode?: string
}

type Access = 'owner' | 'allowed' | 'approval' | 'denied'

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
    let pendingLoad = docs.get(id)
    if (!pendingLoad) {
        pendingLoad = (async () => {
            if (!isValidObjectId(id)) return null
            const record = await Document.findById(id).select('state')
            if (!record) return null
            const ydoc = new Y.Doc()
            if (record.state) Y.applyUpdate(ydoc, new Uint8Array(record.state))
            ydoc.on('update', () => scheduleSave(id, ydoc))
            return ydoc
        })()
        docs.set(id, pendingLoad)
        pendingLoad.then((ydoc) => {
            if (!ydoc) docs.delete(id)
        })
    }
    return pendingLoad
}

async function unloadIfEmpty(io: Server, id: string) {
    const ydoc = await docs.get(id)
    if (!ydoc) return
    await saveNow(id, ydoc)
    if (!io.sockets.adapter.rooms.get(id)?.size) docs.delete(id)
}

async function checkAccess({ docId, token, joinCode }: JoinPayload): Promise<Access> {
    if (!isValidObjectId(docId)) return 'denied'
    const record = await Document.findById(docId).select('owner joinCode joinMode')
    if (!record) return 'denied'

    if (token) {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string }
            if (record.owner.toString() === payload.id) return 'owner'
        } catch {
            // bad token, fall through to the join code check
        }
    }

    if (joinCode && joinCode === record.joinCode) {
        return record.joinMode === 'open' ? 'allowed' : 'approval'
    }
    return 'denied'
}

function broadcastPending(io: Server, docId: string) {
    const list = Array.from(pendingGuests.get(docId)?.entries() ?? []).map(([id, g]) => ({
        id,
        name: g.name,
    }))
    io.to(`owner:${docId}`).emit('pending-requests', docId, list)
}

async function admit(socket: Socket, docId: string, clientId: number) {
    const ydoc = await loadDoc(docId)
    if (!ydoc) {
        socket.emit('doc-error', 'Document not found')
        return false
    }
    socket.join(docId)
    socket.data.clientIds.set(docId, clientId)
    socket.emit('sync', Y.encodeStateAsUpdate(ydoc))
    socket.to(docId).emit('peer-joined')
    return true
}

export function registerDocumentSocket(io: Server) {
    io.on('connection', (socket) => {
        socket.data.clientIds = new Map<string, number>()
        socket.data.ownerDocs = new Set<string>()

        socket.on('join', async (payload: JoinPayload) => {
            const { docId, clientId } = payload

            const access = await checkAccess(payload)
            if (access === 'denied') {
                socket.emit('doc-error', 'You do not have access to this document')
                return
            }

            if (access === 'approval') {
                const name = (payload.name || 'Guest').slice(0, 30)
                let guests = pendingGuests.get(docId)
                if (!guests) {
                    guests = new Map()
                    pendingGuests.set(docId, guests)
                }
                guests.set(socket.id, { name, clientId })
                socket.emit('waiting')
                broadcastPending(io, docId)
                return
            }

            if (access === 'owner') {
                socket.join(`owner:${docId}`)
                socket.data.ownerDocs.add(docId)
            }

            const ok = await admit(socket, docId, clientId)
            if (ok && access === 'owner') broadcastPending(io, docId)
        })

        socket.on('respond-join', async (docId: string, requestId: string, accept: boolean) => {
            if (!socket.data.ownerDocs.has(docId)) return

            const guests = pendingGuests.get(docId)
            const guest = guests?.get(requestId)
            if (!guests || !guest) return

            guests.delete(requestId)
            if (guests.size === 0) pendingGuests.delete(docId)
            broadcastPending(io, docId)

            const target = io.sockets.sockets.get(requestId)
            if (!target) return

            if (accept) {
                await admit(target, docId, guest.clientId)
            } else {
                target.emit('declined')
            }
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
            socket.data.clientIds.forEach((clientId: number, docId: string) => {
                io.to(docId).emit('peer-left', clientId)
                if (!io.sockets.adapter.rooms.get(docId)?.size) {
                    unloadIfEmpty(io, docId).catch((err) => console.error('Unload failed:', err))
                }
            })

            pendingGuests.forEach((guests, docId) => {
                if (guests.delete(socket.id)) {
                    if (guests.size === 0) pendingGuests.delete(docId)
                    broadcastPending(io, docId)
                }
            })
        })
    })
}