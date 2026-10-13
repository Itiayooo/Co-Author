import { useEffect, useState } from 'react'
import type * as Y from 'yjs'
import { noteField } from '../lib/board'

export interface Summary {
    title: string
    preview: string
}

const BLOCK_END = /<\/(paragraph|heading|listItem|codeBlock|blockquote)>/g

function summarize(frag: Y.XmlFragment): Summary {
    const xml = frag
        .toArray()
        .map((n) => n.toString())
        .join('')
    const lines = xml
        .replace(BLOCK_END, '\n')
        .replace(/<[^>]+>/g, '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    return { title: lines[0] ?? 'Empty note', preview: lines.slice(1).join(' ') }
}

export function useNoteSummaries(ydoc: Y.Doc, ids: string[]) {
    const [summaries, setSummaries] = useState<Record<string, Summary>>({})
    const key = ids.join(',')

    useEffect(() => {
        const frags = (key ? key.split(',') : []).map(
            (id) => [id, ydoc.getXmlFragment(noteField(id))] as const
        )
        const update = () =>
            setSummaries(Object.fromEntries(frags.map(([id, frag]) => [id, summarize(frag)])))
        update()
        frags.forEach(([, frag]) => frag.observeDeep(update))
        return () => frags.forEach(([, frag]) => frag.unobserveDeep(update))
    }, [ydoc, key])

    return summaries
}