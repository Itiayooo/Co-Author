import { useEffect, useMemo, useRef, useState } from 'react'
import NoteEditor from './NoteEditor'
import PresenceAvatars from './PresenceAvatars'
import Icon from './Icon'
import { useBoardNotes } from '../hooks/useBoardNotes'
import { useNoteSummaries } from '../hooks/useNoteSummaries'
import { useInert } from '../hooks/useInert'
import { NOTE_COLORS, noteBar, noteBg } from '../lib/noteColors'
import { createNote, deleteNote, getNotesMap, noteField, recolorNote } from '../lib/board'
import type { BoardProps } from './Board'

const roundButton =
    'grid h-10 w-10 flex-none place-items-center rounded-full hover:bg-current/10 focus-visible:outline-2 focus-visible:outline-accent'

export default function PhoneBoard({
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
    const summaries = useNoteSummaries(
        ydoc,
        notes.map((n) => n.id)
    )
    const [query, setQuery] = useState('')
    const [openId, setOpenId] = useState<string | null>(null)
    const [lastId, setLastId] = useState<string | null>(null)
    const sheetRef = useRef<HTMLDivElement>(null)

    useInert(sheetRef, openId === null)

    // close the sheet if someone else deletes the note you have open
    useEffect(() => {
        if (synced && openId && !notes.some((n) => n.id === openId)) setOpenId(null)
    }, [synced, openId, notes])

    const open = (id: string) => {
        setLastId(id)
        setOpenId(id)
    }

    const addNote = () => {
        const n = createNote(getNotesMap(ydoc), notes.length)
        open(n.id)
    }

    const removeNote = (id: string) => {
        if (!window.confirm('Delete this note? It will be removed for everyone.')) return
        setOpenId(null)
        deleteNote(ydoc, id)
    }

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase()
        const newestFirst = [...notes].reverse()
        if (!q) return newestFirst
        return newestFirst.filter((n) => {
            const s = summaries[n.id]
            return s ? `${s.title} ${s.preview}`.toLowerCase().includes(q) : false
        })
    }, [notes, summaries, query])

    const active = notes.find((n) => n.id === lastId) ?? null

    return (
        <div className="relative flex h-full flex-col overflow-hidden bg-desk">
            <header className="flex flex-wrap items-center gap-2 border-b border-line bg-surface px-3 py-2">
                {brand}
                <span className="flex-1" />
                <PresenceAvatars users={users} selfId={selfId} />
                <span
                    role="status"
                    aria-label={status === 'connected' ? 'Live' : 'Not connected'}
                    className={`h-2 w-2 rounded-full ${status === 'connected' ? 'bg-green-500' : 'bg-muted'}`}
                />
                {actions}
            </header>

            <div className="px-3 pb-2 pt-3">
                <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search notes"
                    aria-label="Search notes"
                    className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-[16px] outline-none placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/30"
                />
            </div>

            <ul className="flex-1 space-y-2.5 overflow-auto px-3 pb-28">
                {visible.map((n) => {
                    const s = summaries[n.id]
                    return (
                        <li key={n.id}>
                            <button
                                onClick={() => open(n.id)}
                                className={`w-full rounded-xl px-4 py-3 text-left text-note-ink shadow-note focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${noteBg[n.color]}`}
                            >
                                <span className="block truncate font-bold">{s?.title ?? 'Empty note'}</span>
                                {s?.preview && (
                                    <span className="mt-0.5 line-clamp-2 block text-sm opacity-75">{s.preview}</span>
                                )}
                            </button>
                        </li>
                    )
                })}
                {synced && notes.length === 0 && (
                    <li className="py-10 text-center">
                        <p className="font-semibold">No notes yet</p>
                        <p className="mt-1 text-sm text-muted">Tap + to add one.</p>
                    </li>
                )}
                {notes.length > 0 && visible.length === 0 && (
                    <li className="py-10 text-center text-sm text-muted">No notes match your search.</li>
                )}
            </ul>

            <button
                onClick={addNote}
                aria-label="New note"
                className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 grid h-14 w-14 place-items-center rounded-2xl bg-accent text-accent-ink shadow-note hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
                <Icon d="M12 5v14M5 12h14" size={24} />
            </button>

            <div
                ref={sheetRef}
                aria-hidden={openId === null}
                className={`absolute inset-0 z-30 flex flex-col text-note-ink transition-transform duration-300 ease-out ${active ? noteBg[active.color] : 'bg-surface'
                    } ${openId ? 'translate-y-0' : 'translate-y-full'}`}
            >
                {active && (
                    <>
                        <div className={`flex h-14 flex-none items-center gap-1 px-2 ${noteBar[active.color]}`}>
                            <button
                                aria-label="Back to notes"
                                onClick={() => setOpenId(null)}
                                className={roundButton}
                            >
                                <Icon d="M15 18l-6-6 6-6" size={20} />
                            </button>
                            <span className="flex-1" />
                            <div role="group" aria-label="Note colour" className="flex gap-2 pr-1">
                                {NOTE_COLORS.map((c) => (
                                    <button
                                        key={c}
                                        aria-label={c}
                                        aria-pressed={active.color === c}
                                        onClick={() => recolorNote(getNotesMap(ydoc), active.id, c)}
                                        className={`h-7 w-7 rounded-full border border-black/20 ${noteBar[c]} ${active.color === c ? 'ring-2 ring-ink ring-offset-2 ring-offset-transparent' : ''
                                            }`}
                                    />
                                ))}
                            </div>
                            <button
                                aria-label="Delete note"
                                onClick={() => removeNote(active.id)}
                                className={roundButton}
                            >
                                <Icon d="M4 7h16M10 11v6M14 11v6M6 7l1 12a1 1 0 001 1h8a1 1 0 001-1l1-12M9 7V4h6v3" size={20} />
                            </button>
                        </div>
                        <NoteEditor
                            key={active.id}
                            ydoc={ydoc}
                            awareness={awareness}
                            field={noteField(active.id)}
                            fill
                        />
                    </>
                )}
            </div>
        </div>
    )
}