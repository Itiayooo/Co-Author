import { Server } from 'socket.io'
import * as Y from 'yjs'

const docs = new Map<string, Y.Doc>()

function getDoc(id: string) {
    let doc = docs.get(id)
    if (!doc) {
        doc = new Y.Doc()
        docs.set(id, doc)
    }
    return doc
}

export function registerDocumentSocket(io: Server) {
    io.on('connection', (socket) => {
        // docId -> awareness clientID of this socket, used to clear cursors on disconnect
        const clientIds = new Map<string, number>()

        socket.on('join', (docId: string, clientId: number) => {
            socket.join(docId)
            clientIds.set(docId, clientId)
            socket.emit('sync', Y.encodeStateAsUpdate(getDoc(docId)))
            socket.to(docId).emit('peer-joined')
        })

        socket.on('update', (docId: string, update: Uint8Array) => {
            if (!socket.rooms.has(docId)) return
            Y.applyUpdate(getDoc(docId), new Uint8Array(update))
            socket.to(docId).emit('update', update)
        })

        socket.on('awareness', (docId: string, update: Uint8Array) => {
            if (!socket.rooms.has(docId)) return
            socket.to(docId).emit('awareness', update)
        })

        socket.on('disconnect', () => {
            clientIds.forEach((clientId, docId) => {
                io.to(docId).emit('peer-left', clientId)
            })
        })
    })
}