import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDocumentByCode } from '../lib/documents'
import { useCollabDoc } from '../hooks/useCollabDoc'
import { usePresence } from '../hooks/usePresence'
// import EditorSplit from '../components/EditorSplit'
import PresenceAvatars from '../components/PresenceAvatars'


interface RoomProps {
    docId: string
    title: string
    name: string
    code: string
}

function GuestRoom({ docId, title, name, code }: RoomProps) {
    const { session, status, error, waiting } = useCollabDoc(docId, name, code)
    const users = usePresence(session?.awareness ?? null)

    if (error) {
        return <div className="p-8 text-sm text-gray-700">{error}</div>
    }

    if (waiting) {
        return (
            <div className="flex min-h-screen items-center justify-center px-4">
                <div className="text-center">
                    <p className="font-medium text-gray-900">Waiting for the owner to let you in</p>
                    <p className="mt-1 text-sm text-gray-500">This page opens as soon as they accept.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen flex-col bg-white text-gray-900">
            <header className="flex items-center justify-between border-b border-gray-200 px-4 py-2 text-sm">
                <span className="font-medium">{title}</span>
                <div className="flex items-center gap-4">
                    <PresenceAvatars users={users} selfId={session?.awareness.clientID} />
                    <span className={status === 'connected' ? 'text-green-600' : 'text-gray-400'}>
                        {status === 'connected' ? 'Live' : status === 'connecting' ? 'Connecting...' : 'Offline'}
                    </span>
                </div>
            </header>
            <main className="min-h-0 flex-1">
                {session && <EditorSplit ytext={session.ytext} awareness={session.awareness} />}
            </main>
        </div>
    )
}

export default function Join() {
    const { code = '' } = useParams()
    const { user } = useAuth()
    const [info, setInfo] = useState<{ id: string; title: string } | null>(null)
    const [notFound, setNotFound] = useState(false)
    const [name, setName] = useState(() => localStorage.getItem('guestName') ?? '')
    const [joined, setJoined] = useState(false)

    useEffect(() => {
        getDocumentByCode(code)
            .then(setInfo)
            .catch(() => setNotFound(true))
    }, [code])

    useEffect(() => {
        if (user && !name) setName(user.name)
    }, [user, name])

    const handleJoin = (e: FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return
        localStorage.setItem('guestName', name.trim())
        setJoined(true)
    }

    if (notFound) {
        return <div className="p-8 text-sm text-gray-700">This link is invalid or has expired.</div>
    }
    if (!info) return null

    if (!joined) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <form
                    onSubmit={handleJoin}
                    className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                >
                    <h1 className="mb-1 text-xl font-medium text-gray-900">Join "{info.title}"</h1>
                    <p className="mb-6 text-sm text-gray-500">Pick a name others will see.</p>
                    <input
                        autoFocus
                        required
                        maxLength={30}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="mb-4 w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-600"
                    />
                    <button
                        type="submit"
                        className="w-full rounded bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        Join
                    </button>
                </form>
            </div>
        )
    }

    return <GuestRoom docId={info.id} title={info.title} name={name.trim()} code={code.toUpperCase()} />
}