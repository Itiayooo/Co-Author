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
}

export default function NoteEditor({ ydoc, awareness }: Props) {
    const user = awareness.getLocalState()?.user as { name: string; color: string } | undefined

    const editor = useEditor(
        {
            extensions: [
                StarterKit.configure({ undoRedo: false }),
                Collaboration.configure({ document: ydoc, field: 'note-main' }),
                CollaborationCaret.configure({
                    provider: { awareness },
                    user: { name: user?.name ?? 'Guest', color: user?.color ?? '#4f46e5' },
                }),
            ],
            editorProps: {
                attributes: { class: 'note-editor', 'aria-label': 'Note text' },
            },
        },
        [ydoc, awareness]
    )

    if (!editor) return null

    return (
        <div className="flex h-full flex-col">
            <EditorContent editor={editor} className="min-h-0 flex-1 overflow-auto" />
            <FormatBar editor={editor} />
        </div>
    )
}