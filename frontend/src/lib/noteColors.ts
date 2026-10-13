export const NOTE_COLORS = ['butter', 'mint', 'sky', 'blush', 'lilac'] as const
export type NoteColor = (typeof NOTE_COLORS)[number]

export const noteBg: Record<NoteColor, string> = {
    butter: 'bg-butter',
    mint: 'bg-mint',
    sky: 'bg-sky',
    blush: 'bg-blush',
    lilac: 'bg-lilac',
}

export const noteBar: Record<NoteColor, string> = {
    butter: 'bg-butter-bar',
    mint: 'bg-mint-bar',
    sky: 'bg-sky-bar',
    blush: 'bg-blush-bar',
    lilac: 'bg-lilac-bar',
}

export function colorForId(id: string): NoteColor {
    let hash = 0
    for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
    return NOTE_COLORS[hash % NOTE_COLORS.length]
}