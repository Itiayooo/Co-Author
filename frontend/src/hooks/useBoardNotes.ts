import { useEffect, useState } from 'react'
import type * as Y from 'yjs'
import { getNotesMap, readNotes } from '../lib/board'
import type { NoteMeta } from '../lib/board'

export function useBoardNotes(ydoc: Y.Doc) {
    const [notes, setNotes] = useState<NoteMeta[]>([])

    useEffect(() => {
        const map = getNotesMap(ydoc)
        const update = () => setNotes(readNotes(map))
        update()
        map.observe(update)
        return () => map.unobserve(update)
    }, [ydoc])

    return notes
}