import { useEffect, useRef, useState } from 'react'
import type { PointerEvent, ReactNode } from 'react'
import AuthorTag from '../AuthorTag'
import { useInert } from '../../hooks/useInert'
import { noteBar, noteBg } from '../../lib/noteColors'
import type { NoteColor } from '../../lib/noteColors'

const NOTE_W = 236
const BAR_H = 30
const ADA = '#3A5BD9'
const BOB = '#1F9D5B'

// Bob "types" this line over and over
function TypingLine({ text }: { text: string }) {
    const [shown, setShown] = useState(text)

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        let i = 0
        let dir = 1
        let timer: ReturnType<typeof setTimeout>
        const tick = () => {
            setShown(text.slice(0, i))
            if (dir > 0) {
                if (i === text.length) {
                    dir = -1
                    timer = setTimeout(tick, 3200)
                    return
                }
                i++
                timer = setTimeout(tick, 40 + Math.random() * 70)
            } else {
                if (i === 0) {
                    dir = 1
                    timer = setTimeout(tick, 600)
                    return
                }
                i--
                timer = setTimeout(tick, 16)
            }
        }
        tick()
        return () => clearTimeout(timer)
    }, [text])

    return (
        <>
            <span className="sr-only">{text}</span>
            <span aria-hidden="true">{shown}</span>
            <span className="caret" style={{ ['--c' as string]: BOB }} aria-hidden="true" />
        </>
    )
}

interface NoteData {
    id: string
    color: NoteColor
    title: string
    x: number
    y: number
    rolled: boolean
}

const INITIAL: NoteData[] = [
    { id: 'plan', color: 'sky', title: 'Launch plan', x: 22, y: 26, rolled: false },
    { id: 'code', color: 'mint', title: 'Join code', x: 170, y: 196, rolled: false },
    { id: 'ideas', color: 'blush', title: 'Ideas for the demo', x: 40, y: 336, rolled: true },
]

const BODIES: Record<string, ReactNode> = {
    plan: (
        <>
            <AuthorTag name="Ada" color={ADA} />
            <p className="mt-0.5">Ship the beta by Friday.</p>
            <AuthorTag name="Bob" color={BOB} />
            <p className="mt-0.5 min-h-[42px]">
                <TypingLine text="I will record the demo GIF." />
            </p>
        </>
    ),
    code: (
        <>
            <AuthorTag name="Ada" color={ADA} />
            <p className="mt-0.5">Send friends the code K7M2QX. They only need a name.</p>
        </>
    ),
    ideas: (
        <>
            <AuthorTag name="Bob" color={BOB} />
            <p className="mt-0.5">Open two tabs and type in both.</p>
        </>
    ),
}

interface HeroNoteProps {
    note: NoteData
    z: number
    onMove: (id: string, x: number, y: number) => void
    onFront: (id: string) => void
    onToggle: (id: string) => void
}

function HeroNote({ note, z, onMove, onFront, onToggle }: HeroNoteProps) {
    const foldRef = useRef<HTMLDivElement>(null)
    const start = useRef<{ px: number; py: number; x: number; y: number } | null>(null)
    const [dragging, setDragging] = useState(false)

    useInert(foldRef, note.rolled)

    const down = (e: PointerEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('button')) return
        e.currentTarget.setPointerCapture(e.pointerId)
        start.current = { px: e.clientX, py: e.clientY, x: note.x, y: note.y }
        setDragging(true)
        onFront(note.id)
    }

    const move = (e: PointerEvent<HTMLDivElement>) => {
        const s = start.current
        if (!s) return
        onMove(note.id, s.x + e.clientX - s.px, s.y + e.clientY - s.py)
    }

    const up = () => {
        start.current = null
        setDragging(false)
    }

    return (
        <div
            className="absolute left-0 top-0"
            style={{ width: NOTE_W, zIndex: z, transform: `translate(${note.x}px, ${note.y}px)` }}
        >
            <div className={`overflow-hidden rounded-[10px] text-note-ink shadow-note ${noteBg[note.color]}`}>
                <div
                    onPointerDown={down}
                    onPointerMove={move}
                    onPointerUp={up}
                    onPointerCancel={up}
                    onDoubleClick={(e) => {
                        if (!(e.target as HTMLElement).closest('button')) onToggle(note.id)
                    }}
                    className={`flex h-[30px] touch-none select-none items-center gap-0.5 px-1 ${noteBar[note.color]} ${dragging ? 'cursor-grabbing' : 'cursor-grab'
                        }`}
                >
                    <button
                        type="button"
                        aria-label={note.rolled ? 'Unroll note' : 'Roll up note'}
                        aria-expanded={!note.rolled}
                        onClick={() => onToggle(note.id)}
                        className="grid h-6 w-6 place-items-center rounded-md opacity-55 hover:bg-current/10 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-ink"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            width="14"
                            height="14"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            className={`transition-transform duration-200 ${note.rolled ? '-rotate-90' : ''}`}
                        >
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </button>
                    <span
                        className={`min-w-0 flex-1 truncate px-1.5 text-xs font-semibold transition-opacity duration-200 ${note.rolled ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        {note.title}
                    </span>
                </div>
                <div
                    className={`grid transition-[grid-template-rows] duration-200 ${note.rolled ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
                        }`}
                >
                    <div ref={foldRef} className="min-h-0 overflow-hidden">
                        <div className="px-3.5 pb-3.5 pt-2.5 text-sm leading-normal">{BODIES[note.id]}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function HeroStage() {
    const stageRef = useRef<HTMLDivElement>(null)
    const zTop = useRef(10)
    const [notes, setNotes] = useState(INITIAL)
    const [z, setZ] = useState<Record<string, number>>({})

    const clamp = (x: number, y: number) => {
        const el = stageRef.current
        if (!el || !el.clientWidth) return { x, y }
        return {
            x: Math.max(0, Math.min(x, el.clientWidth - NOTE_W)),
            y: Math.max(0, Math.min(y, el.clientHeight - BAR_H)),
        }
    }

    // keep notes inside the stage when the window changes size
    useEffect(() => {
        const el = stageRef.current
        if (!el) return
        const observer = new ResizeObserver(() => {
            setNotes((prev) =>
                prev.map((n) => ({
                    ...n,
                    x: Math.max(0, Math.min(n.x, el.clientWidth - NOTE_W)),
                    y: Math.max(0, Math.min(n.y, el.clientHeight - BAR_H)),
                }))
            )
        })
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    const move = (id: string, x: number, y: number) => {
        const p = clamp(x, y)
        setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...p } : n)))
    }
    const front = (id: string) => setZ((prev) => ({ ...prev, [id]: ++zTop.current }))
    const toggle = (id: string) =>
        setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, rolled: !n.rolled } : n)))

    return (
        <div
            ref={stageRef}
            aria-label="Try dragging the notes"
            className="dot-grid relative h-[420px] overflow-hidden rounded-[20px] border border-line"
        >
            {notes.map((n) => (
                <HeroNote key={n.id} note={n} z={z[n.id] ?? 1} onMove={move} onFront={front} onToggle={toggle} />
            ))}
            <span className="pointer-events-none absolute bottom-3.5 right-4 font-mono text-[11px] tracking-[0.04em] text-muted">
                Drag a note. Double click a bar to fold it.
            </span>
        </div>
    )
}