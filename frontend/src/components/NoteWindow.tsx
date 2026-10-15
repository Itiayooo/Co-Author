import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react'
import type * as Y from 'yjs'
import type { Awareness } from 'y-protocols/awareness'
import NoteEditor from './NoteEditor'
import PopOutNote from './PopOutNote'
import Icon from './Icon'
import { useInert } from '../hooks/useInert'
import { useNoteTitle } from '../hooks/useNoteTitle'
import { usePopOut } from '../hooks/usePopOut'
import { NOTE_COLORS, noteBar, noteBg } from '../lib/noteColors'
import type { NoteColor } from '../lib/noteColors'
import { NOTE_WIDTH, noteField } from '../lib/board'
import type { NoteMeta } from '../lib/board'

interface Props {
    ydoc: Y.Doc
    awareness: Awareness
    note: NoteMeta
    pos: { x: number; y: number }
    z: number
    rolled: boolean
    minimized: boolean
    onMove: (id: string, x: number, y: number) => void
    onMoveEnd: (id: string) => void
    onFront: (id: string) => void
    onToggleRoll: (id: string) => void
    onColor: (id: string, color: NoteColor) => void
    onClose: (id: string) => void
    canRename: boolean
    onRename: (id: string, title: string) => void
}

const barButton =
    'grid h-7 w-7 flex-none place-items-center rounded-md opacity-65 hover:bg-current/10 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-accent'

export default function NoteWindow({
    ydoc,
    awareness,
    note,
    pos,
    z,
    rolled,
    minimized,
    onMove,
    onMoveEnd,
    onFront,
    onToggleRoll,
    onColor,
    onClose,
    canRename,
    onRename,
}: Props) {
    const rootRef = useRef<HTMLDivElement>(null)
    const foldRef = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLSpanElement>(null)
    const drag = useRef<{ px: number; py: number; x: number; y: number; active: boolean } | null>(null)
    const [dragging, setDragging] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [editing, setEditing] = useState(false)
    const autoTitle = useNoteTitle(ydoc, note.id)
    const title = note.title?.trim() || autoTitle
    const pop = usePopOut(title)

    useInert(rootRef, minimized)
    useInert(foldRef, rolled)

    useEffect(() => {
        if (pop.win) pop.win.document.title = title
    }, [pop.win, title])

    useEffect(() => {
        if (!menuOpen) return
        const close = (e: globalThis.PointerEvent) => {
            const target = e.target as Element
            if (target.closest('[data-menu]') || target.closest('[data-menu-toggle]')) return
            setMenuOpen(false)
        }
        document.addEventListener('pointerdown', close)
        return () => document.removeEventListener('pointerdown', close)
    }, [menuOpen])

    // the pointer is only captured once it really moves, so a double click on the
    // title still reaches the title
    const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
        if (e.button !== 0) return
        if ((e.target as HTMLElement).closest('button, input')) return
        drag.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y, active: false }
        onFront(note.id)
    }

    const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
        const d = drag.current
        if (!d) return
        const dx = e.clientX - d.px
        const dy = e.clientY - d.py
        if (!d.active) {
            if (Math.hypot(dx, dy) < 4) return
            d.active = true
            e.currentTarget.setPointerCapture(e.pointerId)
            setDragging(true)
        }
        onMove(note.id, d.x + dx, d.y + dy)
    }

    const endDrag = () => {
        const d = drag.current
        drag.current = null
        if (d?.active) {
            setDragging(false)
            onMoveEnd(note.id)
        }
    }

    // double click on the title renames, anywhere else on the bar folds the note
    const onBarDoubleClick = (e: MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('button, input')) return
        const r = titleRef.current?.getBoundingClientRect()
        const onTitle =
            !!r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
        if (onTitle && canRename) setEditing(true)
        else onToggleRoll(note.id)
    }

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.target !== e.currentTarget) return
        if (e.key === 'F2' && canRename) {
            e.preventDefault()
            setEditing(true)
            return
        }
        if (e.key === 'Enter') {
            e.preventDefault()
            onToggleRoll(note.id)
            return
        }
        const step = e.shiftKey ? 40 : 12
        const deltas: Record<string, [number, number]> = {
            ArrowLeft: [-step, 0],
            ArrowRight: [step, 0],
            ArrowUp: [0, -step],
            ArrowDown: [0, step],
        }
        const delta = deltas[e.key]
        if (!delta) return
        e.preventDefault()
        onMove(note.id, pos.x + delta[0], pos.y + delta[1])
        onMoveEnd(note.id)
    }

    return (
        <div
            ref={rootRef}
            onFocusCapture={() => onFront(note.id)}
            style={{ width: NOTE_WIDTH, zIndex: z, transform: `translate(${pos.x}px, ${pos.y}px)` }}
            className={`group absolute left-0 top-0 will-change-transform ${dragging ? '' : 'transition-transform duration-150 ease-out'
                }`}
        >
            <div
                className={`origin-top-left overflow-hidden rounded-xl text-note-ink shadow-note transition duration-200 ${noteBg[note.color]
                    } ${minimized ? 'scale-50 opacity-0' : ''}`}
            >
                <div
                    tabIndex={0}
                    aria-label="Note bar. Drag to move, arrow keys also move, Enter rolls it up, F2 renames"
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onDoubleClick={onBarDoubleClick}
                    onKeyDown={onKeyDown}
                    className={`flex h-9 cursor-grab touch-none select-none items-center gap-0.5 px-1 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent active:cursor-grabbing ${noteBar[note.color]
                        }`}
                >
                    <button
                        type="button"
                        className={barButton}
                        aria-label={rolled ? 'Unroll note' : 'Roll up note'}
                        aria-expanded={!rolled}
                        onClick={() => onToggleRoll(note.id)}
                    >
                        <span className={`transition-transform duration-200 ${rolled ? '-rotate-90' : ''}`}>
                            <Icon d="M6 9l6 6 6-6" />
                        </span>
                    </button>
                    {editing ? (
                        <input
                            autoFocus
                            value={note.title ?? ''}
                            onChange={(e) => onRename(note.id, e.target.value)}
                            onFocus={(e) => e.currentTarget.select()}
                            onBlur={() => setEditing(false)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur()
                            }}
                            placeholder={autoTitle}
                            maxLength={60}
                            aria-label="Note title"
                            className="min-w-0 flex-1 rounded-md bg-current/10 px-1.5 py-0.5 text-[13px] font-semibold outline-none placeholder:opacity-45"
                        />
                    ) : (
                        <>
                            <span
                                ref={titleRef}
                                title={canRename ? 'Double click to rename' : undefined}
                                className={`min-w-0 truncate px-1.5 text-[13px] font-semibold ${canRename && !note.title?.trim() ? 'opacity-55' : ''
                                    }`}
                            >
                                {canRename && !note.title?.trim() && autoTitle === 'Empty note'
                                    ? 'Add a title'
                                    : title}
                            </span>
                            <span className="flex-1" />
                        </>
                    )}
                    {pop.supported && (
                        <button
                            type="button"
                            className={barButton}
                            aria-label={pop.win ? 'Bring note back' : 'Open note in its own window'}
                            title={pop.win ? 'Bring note back' : 'Pop out as a floating window'}
                            onClick={() => (pop.win ? pop.close() : pop.open().catch(() => { }))}
                        >
                            <Icon d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                        </button>
                    )}
                    <button
                        type="button"
                        data-menu-toggle
                        className={barButton}
                        aria-label="Note colour"
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        <Icon d="M5 12h.01M12 12h.01M19 12h.01" strokeWidth={3.5} />
                    </button>
                    <button
                        type="button"
                        className={barButton}
                        aria-label="Close note"
                        onClick={() => onClose(note.id)}
                    >
                        <Icon d="M6 6l12 12M18 6L6 18" />
                    </button>
                </div>

                <div
                    className={`grid transition-[grid-template-rows] duration-200 ${rolled ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
                        }`}
                >
                    <div ref={foldRef} className="min-h-0 overflow-hidden">
                        {pop.win ? (
                            <p className="px-3.5 py-5 text-sm opacity-70">
                                This note is open in its own window. Close that window to bring it back.
                            </p>
                        ) : (
                            <NoteEditor ydoc={ydoc} awareness={awareness} field={noteField(note.id)} />
                        )}
                    </div>
                </div>
            </div>

            {pop.win &&
                createPortal(
                    <PopOutNote ydoc={ydoc} awareness={awareness} note={note} title={title} win={pop.win} />,
                    pop.win.document.body
                )}

            {menuOpen && (
                <div
                    data-menu
                    role="group"
                    aria-label="Note colour"
                    className="absolute right-1 top-10 z-10 flex gap-2 rounded-lg border border-line bg-surface p-2 shadow-note"
                >
                    {NOTE_COLORS.map((c) => (
                        <button
                            key={c}
                            type="button"
                            aria-label={c}
                            aria-pressed={note.color === c}
                            onClick={() => onColor(note.id, c)}
                            className={`h-5 w-5 rounded-full border border-black/20 ${noteBar[c]} ${note.color === c ? 'ring-2 ring-ink ring-offset-1 ring-offset-surface' : ''
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}