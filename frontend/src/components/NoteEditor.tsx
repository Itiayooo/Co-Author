import { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'
import type * as Y from 'yjs'
import type { Awareness } from 'y-protocols/awareness'
import FormatBar from './FormatBar'
import { Authorship } from '../lib/authorship'

interface Props {
    ydoc: Y.Doc
    awareness: Awareness
    field: string
    fill?: boolean
}

export default function NoteEditor({ ydoc, awareness, field, fill = false }: Props) {
    const user = awareness.getLocalState()?.user as { name: string; color: string } | undefined
    const name = user?.name ?? 'Guest'
    const color = user?.color ?? '#4f46e5'

    const [notice, setNotice] = useState('')
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

    useEffect(() => () => clearTimeout(timer.current), [])

    const editor = useEditor(
        {
            extensions: [
                StarterKit.configure({ undoRedo: false }),
                Collaboration.configure({ document: ydoc, field }),
                CollaborationCaret.configure({ provider: { awareness }, user: { name, color } }),
                Authorship.configure({
                    name,
                    color,
                    onBlocked: (author) => {
                        setNotice(`That line is ${author}'s. Press Enter below it to add your own.`)
                        clearTimeout(timer.current)
                        timer.current = setTimeout(() => setNotice(''), 3000)
                    },
                }),
            ],
            editorProps: {
                attributes: { class: 'note-editor', 'aria-label': 'Note text' },
            },
        },
        [ydoc, awareness, field]
    )

    if (!editor) return null

    const message = notice && (
        <p role="status" className="px-3.5 pb-2 text-xs opacity-75">
            {notice}
        </p>
    )

    if (fill) {
        return (
            <div className="flex min-h-0 flex-1 flex-col">
                <div className="sheet-body min-h-0 flex-1 overflow-auto">
                    <EditorContent editor={editor} />
                </div>
                {message}
                <div className="flex-none border-t border-current/10 pb-[env(safe-area-inset-bottom)]">
                    <FormatBar editor={editor} large />
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="max-h-56 min-h-24 overflow-auto">
                <EditorContent editor={editor} />
            </div>
            {message}
            <div className="max-h-0 overflow-hidden transition-[max-height] duration-200 group-focus-within:max-h-12">
                <FormatBar editor={editor} />
            </div>
        </>
    )
}