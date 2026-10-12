import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCollabDoc } from '../hooks/useCollabDoc'
import { usePresence } from '../hooks/usePresence'
import { getDocument, updateDocument } from '../lib/documents'
import type { Doc } from '../types/document'
import PresenceAvatars from '../components/PresenceAvatars'
import DocTitle from '../components/DocTitle'
import ShareDialog from '../components/ShareDialog'
import JoinRequests from '../components/JoinRequests'
import EditorSplit from '../components/EditorSplit'


const statusText = {
    connecting: 'Connecting...',
    connected: 'Live',
    disconnected: 'Offline',
}

export default function Editor() {
    const { id = '' } = useParams()
    const { user } = useAuth()
    const { session, status, requests, respond } = useCollabDoc(id, user?.name ?? 'Anonymous')
    const users = usePresence(session?.awareness ?? null)
    const [doc, setDoc] = useState<Doc | null>(null)
    const [notFound, setNotFound] = useState(false)
    const [shareOpen, setShareOpen] = useState(false)


    useEffect(() => {
        getDocument(id)
            .then(setDoc)
            .catch(() => setNotFound(true))
    }, [id])

    const saveTitle = async (title: string) => {
        setDoc(await updateDocument(id, { title }))
    }

    if (notFound) {
        return (
            <div className="p-8 text-sm">
                Document not found.{' '}
                <Link to="/" className="text-indigo-600 hover:underline">
                    Back to docs
                </Link>
            </div>
        )
    }

    return (
        <div className="flex h-screen flex-col bg-white text-gray-900">
            <header className="flex items-center justify-between border-b border-gray-200 px-4 py-2 text-sm">
                <div className="flex items-center gap-4">
                    <Link to="/" className="text-gray-500 hover:text-gray-900">
                        ← Docs
                    </Link>
                    {doc && <DocTitle value={doc.title} onSave={saveTitle} />}
                </div>
                <div className="flex items-center gap-4">
                    <PresenceAvatars users={users} selfId={session?.awareness.clientID} />
                    <span className={status === 'connected' ? 'text-green-600' : 'text-gray-400'}>
                        {statusText[status]}
                    </span>
                    <button
                        onClick={() => setShareOpen(true)}
                        className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        Share
                    </button>
                </div>
            </header>
            <main className="min-h-0 flex-1">
                {session && <EditorSplit ytext={session.ytext} awareness={session.awareness} />}
            </main>
            {shareOpen && doc && (
                <ShareDialog doc={doc} onClose={() => setShareOpen(false)} onChange={setDoc} />
            )}
            <JoinRequests requests={requests} onRespond={respond} />
        </div>
    )
}