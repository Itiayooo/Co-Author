import type * as Y from 'yjs'
import type { Awareness } from 'y-protocols/awareness'
import NoteEditor from './NoteEditor'
import { noteBar, noteBg } from '../lib/noteColors'
import { noteField } from '../lib/board'
import type { NoteMeta } from '../lib/board'

interface Props {
    ydoc: Y.Doc
    awareness: Awareness
    note: NoteMeta
    title: string
}

// what you see inside the small always-on-top window
export default function PopOutNote({ ydoc, awareness, note, title }: Props) {
    return (
        <div className={`flex h-dvh flex-col text-note-ink ${noteBg[note.color]}`}>
            <div
                className={`flex h-9 flex-none items-center truncate px-3.5 text-[13px] font-semibold ${noteBar[note.color]}`}
            >
                {title}
            </div>
            <NoteEditor ydoc={ydoc} awareness={awareness} field={noteField(note.id)} fill />
        </div>
    )
}