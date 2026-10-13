import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type * as Y from 'yjs'
import type { Awareness } from 'y-protocols/awareness'
import NoteWindow from './NoteWindow'
import PresenceAvatars from './PresenceAvatars'
import Button from './Button'
import Icon from './Icon'
import PhoneBoard from './PhoneBoard'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useBoardNotes } from '../hooks/useBoardNotes'
import { useInert } from '../hooks/useInert'
import type { ConnectionStatus } from '../hooks/useCollabDoc'
import type { PresenceUser } from '../hooks/usePresence'
import {
    BAR_HEIGHT,
    NOTE_WIDTH,
    createNote,
    deleteNote,
    getNotesMap,
    moveNote,
    recolorNote,
} from '../lib/board'
import type { NoteMeta } from '../lib/board'
import type { NoteColor } from '../lib/noteColors'

export interface BoardProps {
    ydoc: Y.Doc
    awareness: Awareness
    status: ConnectionStatus
    synced: boolean
    users: PresenceUser[]
    selfId?: number
    brand: ReactNode
    actions?: ReactNode
}

type Pos = { x: number; y: number }

const Divider = () => <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />

const dockButton =
    'grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-desk hover:text-ink focus-visible:outline-2 focus-visible:outline-accent'

function DeskBoard({
    ydoc,
    awareness,
    status,
    synced,
    users,
    selfId,
    brand,
    actions,
}: BoardProps) {
    const notes = useBoardNotes(ydoc)
    const deskRef = useRef<HTMLDivElement>(null)
    const dockRef = useRef<HTMLDivElement>(null)
    const orbRef = useRef<HTMLButtonElement>(null)
    const zTop = useRef(10)
    const pending = useRef<{ id: string; x: number; y: number } | null>(null)
    const frame = useRef(0)

    const [size, setSize] = useState({ w: 0, h: 0 })
    const [sync, setSync] = useState(true)
    const [local, setLocal] = useState<Record<string, Pos>>({})
    const [dragging, setDragging] = useState<(Pos & { id: string }) | null>(null)
    const [rolled, setRolled] = useState<Record<string, boolean>>({})
    const [z, setZ] = useState<Record<string, number>>({})
    const [minimized, setMinimized] = useState(false)

    useInert(dockRef, minimized)
    useInert(orbRef, !minimized)

    useEffect(() => {
        const el = deskRef.current
        if (!el) return
        const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
        measure()
        const observer = new ResizeObserver(measure)
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    useEffect(() => () => cancelAnimationFrame(frame.current), [])

    const clamp = useCallback(
        (p: Pos): Pos => {
            if (!size.w) return p
            return {
                x: Math.max(0, Math.min(p.x, size.w - NOTE_WIDTH)),
                y: Math.max(0, Math.min(p.y, size.h - BAR_HEIGHT)),
            }
        },
        [size]
    )

    const positionOf = (n: NoteMeta): Pos => {
        if (dragging?.id === n.id) return clamp(dragging)
        const base = sync ? { x: n.x, y: n.y } : (local[n.id] ?? { x: n.x, y: n.y })
        return clamp(base)
    }

    const flush = useCallback(() => {
        frame.current = 0
        const p = pending.current
        if (p) {
            moveNote(getNotesMap(ydoc), p.id, p.x, p.y)
            pending.current = null
        }
    }, [ydoc])

    const handleMove = (id: string, x: number, y: number) => {
        const p = clamp({ x, y })
        if (sync) {
            setDragging({ id, ...p })
            pending.current = { id, ...p }
            if (!frame.current) frame.current = requestAnimationFrame(flush)
        } else {
            setLocal((prev) => ({ ...prev, [id]: p }))
        }
    }

    const handleMoveEnd = (id: string) => {
        if (!sync) return
        cancelAnimationFrame(frame.current)
        flush()
        setDragging((d) => (d?.id === id ? null : d))
    }

    const toggleSync = () => {
        setLocal(sync ? Object.fromEntries(notes.map((n) => [n.id, { x: n.x, y: n.y }])) : {})
        setSync(!sync)
    }

    const front = (id: string) => setZ((prev) => ({ ...prev, [id]: ++zTop.current }))

    const addNote = () => {
        const n = createNote(getNotesMap(ydoc), notes.length)
        front(n.id)
    }

    const removeNote = (id: string) => {
        if (window.confirm('Delete this note? It will be removed for everyone.')) {
            deleteNote(ydoc, id)
        }
    }

    const toggleRoll = (id: string) => setRolled((prev) => ({ ...prev, [id]: !prev[id] }))

    const setColor = (id: string, color: NoteColor) =>
        recolorNote(getNotesMap(ydoc), id, color)

    return (
        <div ref={deskRef} className="relative h-full overflow-hidden bg-desk">
            <div
                ref={dockRef}
                role="toolbar"
                aria-label="Board controls"
                className={`absolute left-3 top-3 z-[1000] flex max-w-[calc(100%-1.5rem)] origin-top-left flex-wrap items-center gap-1 rounded-xl border border-line bg-surface p-1 shadow-note transition duration-200 ${minimized ? 'pointer-events-none scale-75 opacity-0' : ''
                    }`}
            >
                {brand}
                <Divider />
                <button type="button" aria-label="New note" onClick={addNote} className={dockButton}>
                    <Icon d="M12 5v14M5 12h14" />
                </button>
                <Divider />
                <button
                    type="button"
                    role="switch"
                    aria-checked={sync}
                    onClick={toggleSync}
                    title="When on, moving a note moves it on everyone's screen"
                    className="flex h-8 items-center gap-2 rounded-lg px-2 text-xs font-medium hover:bg-desk focus-visible:outline-2 focus-visible:outline-accent"
                >
                    <span className={`relative h-4 w-7 rounded-full transition-colors ${sync ? 'bg-accent' : 'bg-line'}`}>
                        <span className={`absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-page transition-transform ${sync ? 'translate-x-3' : ''}`} />
                    </span>
                    <span className="hidden sm:inline">Move together</span>
                </button>
                <Divider />
                <PresenceAvatars users={users} selfId={selfId} />
                <span role="status" className="mx-1 flex items-center gap-1.5 text-xs text-muted">
                    <span className={`h-2 w-2 rounded-full ${status === 'connected' ? 'bg-green-500' : 'bg-muted'}`} />
                    <span className="hidden sm:inline">
                        {status === 'connected' ? 'Live' : status === 'connecting' ? 'Connecting' : 'Offline'}
                    </span>
                </span>
                {actions}
                <Divider />
                <button
                    type="button"
                    aria-label="Minimize board"
                    onClick={() => setMinimized(true)}
                    className={dockButton}
                >
                    <Icon d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
                </button>
            </div>

            <button
                ref={orbRef}
                type="button"
                aria-label="Open board"
                onClick={() => setMinimized(false)}
                className={`absolute left-3 top-3 z-[1000] grid h-11 w-11 place-items-center rounded-full bg-accent font-bold text-accent-ink shadow-note transition duration-200 ${minimized ? '' : 'pointer-events-none scale-50 opacity-0'
                    }`}
            >
                C
                <span className="absolute -right-1 -top-1 grid min-w-[18px] place-items-center rounded-full border border-line bg-surface px-1 text-[11px] font-bold text-ink">
                    {notes.length}
                </span>
            </button>

            {synced && notes.length === 0 && (
                <div className="absolute inset-0 grid place-items-center px-6 text-center">
                    <div>
                        <p className="font-semibold">No notes yet</p>
                        <p className="mt-1 text-sm text-muted">Add one and start writing.</p>
                        <Button onClick={addNote} className="mt-4">
                            New note
                        </Button>
                    </div>
                </div>
            )}

            {notes.map((n) => (
                <NoteWindow
                    key={n.id}
                    ydoc={ydoc}
                    awareness={awareness}
                    note={n}
                    pos={positionOf(n)}
                    z={z[n.id] ?? 1}
                    rolled={!!rolled[n.id]}
                    minimized={minimized}
                    onMove={handleMove}
                    onMoveEnd={handleMoveEnd}
                    onFront={front}
                    onToggleRoll={toggleRoll}
                    onColor={setColor}
                    onClose={removeNote}
                />
            ))}
        </div>
    )
}

export default function Board(props: BoardProps) {
    const phone = useMediaQuery('(max-width: 639px)')
    return phone ? <PhoneBoard {...props} /> : <DeskBoard {...props} />
}