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
    key: string
}
const pendingGuests = new Map<string, Map<string, PendingGuest>>()

interface JoinPayload {
    docId: string
    clientId: number
    name?: string
    token?: string
    joinCode?: string
    guestKey?: string
}

type Access = 'owner' | 'allowed' | 'approval' | 'denied'

interface AccessResult {
    access: Access
    key: string
}

const cleanName = (raw?: string) => (raw ?? '').trim().slice(0, 40)

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

// Works out who is joining. `key` is a stable id for the person:
// their account id if logged in, otherwise a random id kept in their browser.
async function checkAccess(
    { docId, token, joinCode, guestKey }: JoinPayload,
    socketId: string
): Promise<AccessResult> {
    let key = `guest:${(guestKey ?? '').slice(0, 64) || socketId}`

    if (!isValidObjectId(docId)) return { access: 'denied', key }
    const record = await Document.findById(docId).select('owner joinCode joinMode')
    if (!record) return { access: 'denied', key }

    if (token) {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string }
            key = `user:${payload.id}`
            if (record.owner.toString() === payload.id) return { access: 'owner', key }
        } catch {
            // bad token, treat as a guest
        }
    }

    if (joinCode && joinCode === record.joinCode) {
        return { access: record.joinMode === 'open' ? 'allowed' : 'approval', key }
    }
    return { access: 'denied', key }
}

// true if nobody else has claimed this name on this board
async function nameIsFree(docId: string, key: string, name: string) {
    const taken = await Document.exists({
        _id: docId,
        participants: { $elemMatch: { name: name.toLowerCase(), key: { $ne: key } } },
    })
    return !taken
}

// first person to use a name on a board keeps it. The owner always keeps theirs.
async function claimName(docId: string, key: string, name: string, isOwner: boolean) {
    const lower = name.toLowerCase()

    if (isOwner) {
        await Document.updateOne(
            { _id: docId },
            { $pull: { participants: { name: lower, key: { $ne: key } } } }
        )
    }

    const pushed = await Document.findOneAndUpdate(
        { _id: docId, 'participants.name': { $ne: lower } },
        { $push: { participants: { key, name: lower, label: name } } }
    )
    if (pushed) return true

    // the name already exists, so it is only ok if it is already mine
    return nameIsFree(docId, key, name)
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

            const { access, key } = await checkAccess(payload, socket.id)
            if (access === 'denied') {
                socket.emit('doc-error', 'You do not have access to this document')
                return
            }

            const name = cleanName(payload.name) || 'Guest'

            if (access === 'approval') {
                if (!(await nameIsFree(docId, key, name))) {
                    socket.emit('name-taken')
                    return
                }
                let guests = pendingGuests.get(docId)
                if (!guests) {
                    guests = new Map()
                    pendingGuests.set(docId, guests)
                }
                guests.set(socket.id, { name, clientId, key })
                socket.emit('waiting')
                broadcastPending(io, docId)
                return
            }

            if (!(await claimName(docId, key, name, access === 'owner'))) {
                socket.emit('name-taken')
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

            if (!accept) {
                target.emit('declined')
                return
            }
            if (!(await claimName(docId, guest.key, guest.name, false))) {
                target.emit('name-taken')
                return
            }
            await admit(target, docId, guest.clientId)
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