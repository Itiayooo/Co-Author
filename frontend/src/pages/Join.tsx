import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDocumentByCode } from '../lib/documents'
import { useCollabDoc } from '../hooks/useCollabDoc'
import { usePresence } from '../hooks/usePresence'
import Board from '../components/Board'
import AuthShell from '../components/AuthShell'
import TextField from '../components/TextField'
import Button from '../components/Button'
import { LogoMark } from '../components/Logo'

interface RoomProps {
    docId: string
    title: string
    name: string
    code: string
    onNameTaken: () => void
}

function GuestRoom({ docId, title, name, code, onNameTaken }: RoomProps) {
    const { session, status, error, waiting, synced, nameTaken } = useCollabDoc(docId, name, code)
    const users = usePresence(session?.awareness ?? null)

    useEffect(() => {
        if (nameTaken) onNameTaken()
    }, [nameTaken, onNameTaken])

    if (error) {
        return <div className="p-8 text-sm text-muted">{error}</div>
    }

    if (waiting) {
        return (
            <div className="flex min-h-screen items-center justify-center px-4">
                <div className="text-center">
                    <p className="font-semibold">Waiting for the owner to let you in</p>
                    <p className="mt-1 text-sm text-muted">This page opens as soon as they accept.</p>
                </div>
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
                            <span className="grid h-8 w-8 place-items-center">
                                <LogoMark />
                            </span>
                            <span className="max-w-40 truncate px-2 text-sm font-semibold">{title}</span>
                        </>
                    }
                />
            )}
        </div>
    )
}

export default function Join() {
    const { code = '' } = useParams()
    const { user } = useAuth()
    const [info, setInfo] = useState<{ id: string; title: string } | null>(null)
    const [notFound, setNotFound] = useState(false)
    const [name, setName] = useState(() => localStorage.getItem('guestName') ?? '')
    const [nameError, setNameError] = useState('')
    const [joined, setJoined] = useState(
        () =>
            !!localStorage.getItem('guestName') &&
            sessionStorage.getItem(`joined:${code.toUpperCase()}`) === '1'
    )


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
        setNameError('')
        sessionStorage.setItem(`joined:${code.toUpperCase()}`, '1')
        setJoined(true)
    }

    if (notFound) {
        return <div className="p-8 text-sm text-muted">This link is invalid or has expired.</div>
    }
    if (!info) return null

    if (!joined) {
        return (
            <AuthShell
                title={`Join "${info.title}"`}
                subtitle="Pick a name others will see."
                art="join"
                footer="No account needed."
            >
                <form onSubmit={handleJoin}>
                    {nameError && (
                        <p
                            role="alert"
                            className="mb-4 rounded-lg border border-danger-line bg-danger-bg px-3 py-2 text-sm text-danger"
                        >
                            {nameError}
                        </p>
                    )}
                    <TextField
                        label="Your name"
                        autoFocus
                        required
                        maxLength={30}
                        autoComplete="nickname"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Button type="submit" className="w-full">
                        Join
                    </Button>
                </form>
            </AuthShell>
        )
    }

    return (
        <GuestRoom
            docId={info.id}
            title={info.title}
            name={name.trim()}
            code={code.toUpperCase()}
            onNameTaken={() => {
                setNameError('Someone already uses that name on this board. Pick another.')
                sessionStorage.removeItem(`joined:${code.toUpperCase()}`)
                setJoined(false)
            }}
        />
    )
}