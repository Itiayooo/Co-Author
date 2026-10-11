import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { keymap } from '@codemirror/view'
import { EditorView, basicSetup } from 'codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { yCollab, yUndoManagerKeymap } from 'y-codemirror.next'
import type * as Y from 'yjs'
import type { Awareness } from 'y-protocols/awareness'

interface Props {
    ytext: Y.Text
    awareness: Awareness
}

export default function MarkdownEditor({ ytext, awareness }: Props) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!ref.current) return
        const view = new EditorView({
            state: EditorState.create({
                doc: ytext.toString(),
                extensions: [
                    keymap.of(yUndoManagerKeymap),
                    basicSetup,
                    markdown(),
                    EditorView.lineWrapping,
                    yCollab(ytext, awareness),
                ],
            }),
            parent: ref.current,
        })
        return () => view.destroy()
    }, [ytext, awareness])

    return <div ref={ref} className="h-full" />
}