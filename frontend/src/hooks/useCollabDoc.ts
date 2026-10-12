import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import * as Y from 'yjs'
import {
    Awareness,
    applyAwarenessUpdate,
    encodeAwarenessUpdate,
    removeAwarenessStates,
} from 'y-protocols/awareness'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000'

const COLORS = [
    { color: '#4f46e5', light: '#4f46e533' },
    { color: '#16a34a', light: '#16a34a33' },
    { color: '#ea580c', light: '#ea580c33' },
    { color: '#db2777', light: '#db277733' },
    { color: '#0d9488', light: '#0d948833' },
    { color: '#9333ea', light: '#9333ea33' },
    { color: '#d97706', light: '#d9770633' },
    { color: '#0284c7', light: '#0284c733' },
]

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

interface Session {
    ytext: Y.Text
    awareness: Awareness
}

interface AwarenessChange {
    added: number[]
    updated: number[]
    removed: number[]
}

export function useCollabDoc(docId: string, userName: string, joinCode?: string) {
    const [session, setSession] = useState<Session | null>(null)
    const [status, setStatus] = useState<ConnectionStatus>('connecting')
    const [error, setError] = useState('')

    useEffect(() => {
        setError('')

        const ydoc = new Y.Doc()
        const ytext = ydoc.getText('content')
        const awareness = new Awareness(ydoc)
        const palette = COLORS[ydoc.clientID % COLORS.length]
        awareness.setLocalStateField('user', {
            name: userName,
            color: palette.color,
            colorLight: palette.light,
        })

        const socket = io(SOCKET_URL)

        const sendOwnAwareness = () =>
            socket.emit('awareness', docId, encodeAwarenessUpdate(awareness, [ydoc.clientID]))

        const onDocUpdate = (update: Uint8Array, origin: unknown) => {
            if (origin === 'remote') return
            socket.emit('update', docId, update)
        }
        const onAwarenessUpdate = ({ added, updated, removed }: AwarenessChange, origin: unknown) => {
            if (origin === 'remote') return
            socket.emit(
                'awareness',
                docId,
                encodeAwarenessUpdate(awareness, [...added, ...updated, ...removed])
            )
        }
        ydoc.on('update', onDocUpdate)
        awareness.on('update', onAwarenessUpdate)

        socket.on('connect', () => {
            setStatus('connected')
            socket.emit('join', {
                docId,
                clientId: ydoc.clientID,
                token: localStorage.getItem('token') ?? undefined,
                joinCode,
            })
        })
        socket.on('doc-error', (message: string) => {
            setError(message)
            socket.disconnect()
        })
        socket.on('sync', (state: ArrayBuffer) => {
            Y.applyUpdate(ydoc, new Uint8Array(state), 'remote')
            // push anything typed while offline, then announce ourselves
            socket.emit('update', docId, Y.encodeStateAsUpdate(ydoc))
            sendOwnAwareness()
        })
        socket.on('update', (update: ArrayBuffer) => {
            Y.applyUpdate(ydoc, new Uint8Array(update), 'remote')
        })
        socket.on('awareness', (update: ArrayBuffer) => {
            applyAwarenessUpdate(awareness, new Uint8Array(update), 'remote')
        })
        socket.on('peer-joined', sendOwnAwareness)
        socket.on('peer-left', (clientId: number) => {
            removeAwarenessStates(awareness, [clientId], 'remote')
        })
        socket.on('disconnect', () => setStatus('disconnected'))

        setSession({ ytext, awareness })

        return () => {
            ydoc.off('update', onDocUpdate)
            awareness.off('update', onAwarenessUpdate)
            socket.disconnect()
            awareness.destroy()
            ydoc.destroy()
            setSession(null)
        }
    }, [docId, userName, joinCode])

    return { session, status, error }
}