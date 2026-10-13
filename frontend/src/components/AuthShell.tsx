import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import StaticNote from './StaticNote'
import type { NoteColor } from '../lib/noteColors'

const ADA = '#3A5BD9'
const BOB = '#1F9D5B'

interface ArtNote {
    color: NoteColor
    author: { name: string; color: string }
    text: string
}

const ART: Record<'login' | 'register' | 'join', ArtNote[]> = {
    login: [
        { color: 'sky', author: { name: 'Ada', color: ADA }, text: 'Pick up where you left off.' },
        { color: 'mint', author: { name: 'Bob', color: BOB }, text: 'Your boards are right here.' },
    ],
    register: [
        { color: 'blush', author: { name: 'You', color: ADA }, text: 'Make a board. Share the code.' },
        { color: 'sky', author: { name: 'Friend', color: BOB }, text: 'I just joined with the code.' },
    ],
    join: [
        { color: 'sky', author: { name: 'Ada', color: ADA }, text: 'Pick a name and jump in.' },
        { color: 'mint', author: { name: 'Bob', color: BOB }, text: 'We are already writing.' },
    ],
}

const POSITIONS = [
    { x: 44, y: 70 },
    { x: 150, y: 210 },
]

interface Props {
    title: string
    subtitle: string
    children: ReactNode
    footer: ReactNode
    art?: keyof typeof ART
}

export default function AuthShell({ title, subtitle, children, footer, art = 'login' }: Props) {
    return (
        <div className="grid min-h-screen bg-page text-ink lg:grid-cols-2">
            <aside
                className="dot-grid relative hidden overflow-hidden border-r border-line lg:block"
                aria-hidden="true"
            >
                {ART[art].map((n, i) => (
                    <StaticNote key={n.text} {...n} {...POSITIONS[i]} />
                ))}
                <p className="absolute bottom-10 left-10 m-0 max-w-[12ch] text-4xl font-bold leading-none tracking-[-0.05em]">
                    Notes you write together.
                </p>
            </aside>

            <main className="flex flex-col px-5 pb-8 pt-6 lg:px-10 lg:pb-10 lg:pt-7">
                <Link to="/" className="w-fit text-sm font-medium text-muted hover:text-ink">
                    &larr; Home
                </Link>
                <div className="m-auto w-full max-w-[360px] py-8">
                    <h1 className="text-[32px] font-bold leading-[1.1] tracking-[-0.045em]">{title}</h1>
                    <p className="mb-7 mt-2 text-muted">{subtitle}</p>
                    {children}
                    <p className="mt-6 text-center text-sm text-muted">{footer}</p>
                </div>
            </main>
        </div>
    )
}