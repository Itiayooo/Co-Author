import { useEditorState } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import Icon from './Icon'

// export default function FormatBar({ editor, large = false }: { editor: Editor; large?: boolean }) {
export default function FormatBar({ editor }: { editor: Editor; large?: boolean }) {
    const active = useEditorState({
        editor,
        selector: ({ editor }) => ({
            bold: editor.isActive('bold'),
            italic: editor.isActive('italic'),
            underline: editor.isActive('underline'),
            strike: editor.isActive('strike'),
            list: editor.isActive('bulletList'),
        }),
    })

    const buttons = [
        {
            label: 'Bold',
            on: active.bold,
            run: () => editor.chain().focus().toggleBold().run(),
            d: 'M7 5h6a3.5 3.5 0 010 7H7zM7 12h7a3.5 3.5 0 010 7H7z',
        },
        {
            label: 'Italic',
            on: active.italic,
            run: () => editor.chain().focus().toggleItalic().run(),
            d: 'M10 5h8M6 19h8M15 5l-6 14',
        },
        {
            label: 'Underline',
            on: active.underline,
            run: () => editor.chain().focus().toggleUnderline().run(),
            d: 'M7 4v7a5 5 0 0010 0V4M5 20h14',
        },
        {
            label: 'Strikethrough',
            on: active.strike,
            run: () => editor.chain().focus().toggleStrike().run(),
            d: 'M5 12h14M16 7c-.6-1.4-2.2-2-4-2-2.4 0-4 1.2-4 3 0 1.4.8 2.2 2.5 2.7M8 17c.6 1.4 2.2 2 4 2 2.4 0 4-1.2 4-3',
        },
        {
            label: 'Bulleted list',
            on: active.list,
            run: () => editor.chain().focus().toggleBulletList().run(),
            d: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01',
        },
    ]

    return (
        <div
            role="toolbar"
            aria-label="Formatting"
            className="flex items-center gap-1 px-2 pb-1.5 pt-0.5"
        >
            {buttons.map((b) => (
                <button
                    key={b.label}
                    type="button"
                    aria-label={b.label}
                    aria-pressed={b.on}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={b.run}
                    className={`grid h-8 w-8 place-items-center rounded-md hover:bg-current/10 focus-visible:outline-2 focus-visible:outline-accent ${b.on ? 'bg-current/15 opacity-100' : 'opacity-70 hover:opacity-100'
                        }`}
                >
                    <Icon d={b.d} />
                </button>
            ))}
        </div>
    )
}