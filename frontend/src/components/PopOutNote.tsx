import { useRef, useState } from 'react'
import type * as Y from 'yjs'
import type { Awareness } from 'y-protocols/awareness'
import NoteEditor from './NoteEditor'
import Icon from './Icon'
import { noteBar, noteBg } from '../lib/noteColors'
import { noteField } from '../lib/board'
import type { NoteMeta } from '../lib/board'

interface Props {
    ydoc: Y.Doc
    awareness: Awareness
    note: NoteMeta
    title: string
    win: Window
}

// what you see inside the small always-on-top window
export default function PopOutNote({ ydoc, awareness, note, title, win }: Props) {
    const [folded, setFolded] = useState(false)
    const size = useRef<{ w: number; h: number } | null>(null)

    const toggleFold = () => {
        try {
            if (!folded) {
                size.current = { w: win.outerWidth, h: win.outerHeight }
                win.resizeTo(1, 1) // the browser stops at the smallest size it allows
            } else if (size.current) {
                win.resizeTo(size.current.w, size.current.h)
            }
        } catch {
            // resizing was refused, the note still folds inside the window
        }
        setFolded(!folded)
    }

    return (
        <div className={`flex h-dvh flex-col text-note-ink ${noteBg[note.color]}`}>
            <div className={`flex h-9 flex-none items-center gap-0.5 px-1 ${noteBar[note.color]}`}>
                <button
                    type="button"
                    onClick={toggleFold}
                    aria-label={folded ? 'Unfold note' : 'Fold note'}
                    aria-expanded={!folded}
                    title={folded ? 'Unfold' : 'Shrink as small as the browser allows'}
                    className="grid h-7 w-7 flex-none place-items-center rounded-md opacity-65 hover:bg-current/10 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-accent"
                >
                    <span className={`transition-transform duration-200 ${folded ? '-rotate-90' : ''}`}>
                        <Icon d="M6 9l6 6 6-6" />
                    </span>
                </button>
                <span className="min-w-0 flex-1 truncate px-1.5 text-[13px] font-semibold">{title}</span>
            </div>
            <div className={folded ? 'hidden' : 'flex min-h-0 flex-1 flex-col'}>
                <NoteEditor ydoc={ydoc} awareness={awareness} field={noteField(note.id)} fill />
            </div>
        </div>
    )
}