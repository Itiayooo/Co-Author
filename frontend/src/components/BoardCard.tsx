import { Link } from 'react-router-dom'
import type { Doc } from '../types/document'
import { colorForId, noteBar, noteBg } from '../lib/noteColors'

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

interface Props {
    doc: Doc
    onDelete: (id: string) => void
}

export default function BoardCard({ doc, onDelete }: Props) {
    const color = colorForId(doc.id)

    return (
        <li className={`overflow-hidden rounded-xl text-note-ink shadow-note ${noteBg[color]}`}>
            <div className={`flex h-9 items-center justify-end px-1.5 ${noteBar[color]}`}>
                <button
                    onClick={() => onDelete(doc.id)}
                    aria-label={`Delete ${doc.title}`}
                    className="grid h-7 w-7 place-items-center rounded-md opacity-60 hover:bg-black/10 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-accent"
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        aria-hidden="true"
                    >
                        <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                </button>
            </div>
            <Link
                to={`/doc/${doc.id}`}
                className="block min-h-28 px-4 pb-4 pt-3 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
            >
                <h2 className="truncate text-[17px] font-bold">{doc.title}</h2>
                <p className="mt-1 text-sm opacity-75">Edited {formatDate(doc.updatedAt)}</p>
                <p className="mt-4 text-xs opacity-70">
                    Code <span className="font-mono tracking-widest">{doc.joinCode}</span>
                </p>
            </Link>
        </li>
    )
}