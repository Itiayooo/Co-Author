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
        socket.on('join', (docId: string) => {
            socket.join(docId)
            socket.emit('sync', Y.encodeStateAsUpdate(getDoc(docId)))
        })

        socket.on('update', (docId: string, update: Uint8Array) => {
            if (!socket.rooms.has(docId)) return
            Y.applyUpdate(getDoc(docId), new Uint8Array(update))
            socket.to(docId).emit('update', update)
        })
    })
}