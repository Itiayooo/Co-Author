import type * as Y from 'yjs'
// import { NOTE_COLORS } from './noteColors'
import type { NoteColor } from './noteColors'

export const DEFAULT_NOTE_COLOR: NoteColor = 'sky'

export interface NoteMeta {
    id: string
    color: NoteColor
    x: number
    y: number
    createdAt: number
}

export const NOTE_WIDTH = 260
export const BAR_HEIGHT = 36

export const noteField = (id: string) => `note-${id}`
export const getNotesMap = (ydoc: Y.Doc) => ydoc.getMap<NoteMeta>('notes')

export function readNotes(map: Y.Map<NoteMeta>): NoteMeta[] {
    return Array.from(map.values()).sort((a, b) => a.createdAt - b.createdAt)
}

export function createNote(map: Y.Map<NoteMeta>, index: number): NoteMeta {
    const slot = index % 6
    const note: NoteMeta = {
        id: Math.random().toString(36).slice(2, 10),
        // color: NOTE_COLORS[index % NOTE_COLORS.length],
        color: DEFAULT_NOTE_COLOR,
        x: 24 + slot * 28,
        y: 84 + slot * 26,
        createdAt: Date.now(),
    }
    map.set(note.id, note)
    return note
}

export function moveNote(map: Y.Map<NoteMeta>, id: string, x: number, y: number) {
    const current = map.get(id)
    if (current) map.set(id, { ...current, x, y })
}

export function recolorNote(map: Y.Map<NoteMeta>, id: string, color: NoteColor) {
    const current = map.get(id)
    if (current) map.set(id, { ...current, color })
}

export function deleteNote(ydoc: Y.Doc, id: string) {
    const frag = ydoc.getXmlFragment(noteField(id))
    ydoc.transact(() => {
        if (frag.length) frag.delete(0, frag.length)
        getNotesMap(ydoc).delete(id)
    })
}