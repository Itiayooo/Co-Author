import { useEffect, useState } from 'react'
import type * as Y from 'yjs'
import { noteField } from '../lib/board'

export function useNoteTitle(ydoc: Y.Doc, id: string) {
    const [title, setTitle] = useState('')

    useEffect(() => {
        const frag = ydoc.getXmlFragment(noteField(id))
        const update = () => {
            const first = frag.length ? frag.get(0).toString() : ''
            const text = first.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
            setTitle(text || 'Empty note')
        }
        update()
        frag.observeDeep(update)
        return () => frag.unobserveDeep(update)
    }, [ydoc, id])

    return title
}