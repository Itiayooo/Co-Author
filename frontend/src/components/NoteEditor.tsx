import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'
import type * as Y from 'yjs'
import type { Awareness } from 'y-protocols/awareness'
import FormatBar from './FormatBar'

interface Props {
    ydoc: Y.Doc
    awareness: Awareness
    field: string
}

export default function NoteEditor({ ydoc, awareness, field }: Props) {
    const user = awareness.getLocalState()?.user as { name: string; color: string } | undefined

    const editor = useEditor(
        {
            extensions: [
                StarterKit.configure({ undoRedo: false }),
                Collaboration.configure({ document: ydoc, field }),
                CollaborationCaret.configure({
                    provider: { awareness },
                    user: { name: user?.name ?? 'Guest', color: user?.color ?? '#4f46e5' },
                }),
            ],
            editorProps: {
                attributes: { class: 'note-editor', 'aria-label': 'Note text' },
            },
        },
        [ydoc, awareness, field]
    )

    if (!editor) return null

    return (
        <>
            <div className="max-h-56 min-h-24 overflow-auto">
                <EditorContent editor={editor} />
            </div>
            <div className="max-h-0 overflow-hidden transition-[max-height] duration-200 group-focus-within:max-h-12">
                <FormatBar editor={editor} />
            </div>
        </>
    )
}