import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCollabDoc } from '../hooks/useCollabDoc'
import { usePresence } from '../hooks/usePresence'
import { getDocument, updateDocument } from '../lib/documents'
import type { Doc } from '../types/document'
import Board from '../components/Board'
import DocTitle from '../components/DocTitle'
import ShareDialog from '../components/ShareDialog'
import JoinRequests from '../components/JoinRequests'
import { LogoMark } from '../components/Logo'
import { buttonClass } from '../components/Button'

export default function Editor() {
    const { id = '' } = useParams()
    const { user } = useAuth()
    const { session, status, synced, requests, respond } = useCollabDoc(id, user?.name ?? 'Anonymous')
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
                Board not found.{' '}
                <Link to="/" className="font-semibold text-accent hover:underline">
                    Back to boards
                </Link>
            </div>
        )
    }

    return (
        <div className="h-dvh">
            {session && (
                <Board
                    key={session.ydoc.clientID}
                    ydoc={session.ydoc}
                    awareness={session.awareness}
                    status={status}
                    synced={synced}
                    users={users}
                    selfId={session.awareness.clientID}
                    brand={
                        <>
                            <Link to="/" aria-label="Back to boards" className="grid h-8 w-8 place-items-center">
                                <LogoMark />
                            </Link>
                            {doc && <DocTitle value={doc.title} onSave={saveTitle} />}
                        </>
                    }
                    actions={
                        <button onClick={() => setShareOpen(true)} className={buttonClass('primary', 'sm', 'ml-1')}>
                            Share
                        </button>
                    }
                />
            )}
            {shareOpen && doc && (
                <ShareDialog doc={doc} onClose={() => setShareOpen(false)} onChange={setDoc} />
            )}
            <JoinRequests requests={requests} onRespond={respond} />
        </div>
    )
}