import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import * as Y from 'yjs'
import { Awareness } from 'y-protocols/awareness'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000'

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

interface Session {
    ytext: Y.Text
    awareness: Awareness
}

export function useCollabDoc(docId: string) {
    const [session, setSession] = useState<Session | null>(null)
    const [status, setStatus] = useState<ConnectionStatus>('connecting')

    useEffect(() => {
        const ydoc = new Y.Doc()
        const ytext = ydoc.getText('content')
        const awareness = new Awareness(ydoc)
        const socket = io(SOCKET_URL)

        const onDocUpdate = (update: Uint8Array, origin: unknown) => {
            if (origin === 'remote') return
            socket.emit('update', docId, update)
        }
        ydoc.on('update', onDocUpdate)

        socket.on('connect', () => {
            setStatus('connected')
            socket.emit('join', docId)
            // push anything typed while offline
            socket.emit('update', docId, Y.encodeStateAsUpdate(ydoc))
        })
        socket.on('sync', (state: ArrayBuffer) => {
            Y.applyUpdate(ydoc, new Uint8Array(state), 'remote')
        })
        socket.on('update', (update: ArrayBuffer) => {
            Y.applyUpdate(ydoc, new Uint8Array(update), 'remote')
        })
        socket.on('disconnect', () => setStatus('disconnected'))

        setSession({ ytext, awareness })

        return () => {
            ydoc.off('update', onDocUpdate)
            socket.disconnect()
            awareness.destroy()
            ydoc.destroy()
            setSession(null)
        }
    }, [docId])

    return { session, status }
}