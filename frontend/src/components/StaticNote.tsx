import AuthorTag from './AuthorTag'
import { noteBar, noteBg } from '../lib/noteColors'
import type { NoteColor } from '../lib/noteColors'

interface Props {
    color: NoteColor
    author: { name: string; color: string }
    text: string
    x: number
    y: number
}

export default function StaticNote({ color, author, text, x, y }: Props) {
    return (
        <div
            className="absolute left-0 top-0 w-60"
            style={{ transform: `translate(${x}px, ${y}px)` }}
            aria-hidden="true"
        >
            <div className={`overflow-hidden rounded-[10px] text-note-ink shadow-note ${noteBg[color]}`}>
                <div className={`h-[30px] ${noteBar[color]}`} />
                <div className="px-3.5 pb-3.5 pt-2.5 text-sm leading-normal">
                    <AuthorTag name={author.name} color={author.color} />
                    <p className="mt-0.5">{text}</p>
                </div>
            </div>
        </div>
    )
}