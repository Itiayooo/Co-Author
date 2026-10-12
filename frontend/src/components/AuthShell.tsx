import type { ReactNode } from 'react'

interface Props {
    title: string
    subtitle: string
    children: ReactNode
    footer: ReactNode
}

export default function AuthShell({ title, subtitle, children, footer }: Props) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-desk px-4 py-10">
            <div className="w-full max-w-sm overflow-hidden rounded-xl bg-butter text-note-ink shadow-note">
                <div className="flex h-10 items-center gap-2 bg-butter-bar px-3">
                    <span className="grid h-6 w-6 place-items-center rounded-md bg-accent text-sm font-bold text-white">
                        C
                    </span>
                    <span className="text-sm font-semibold">Coauthor</span>
                </div>
                <div className="px-6 pb-6 pt-5">
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    <p className="mb-5 mt-1 text-sm opacity-75">{subtitle}</p>
                    {children}
                    <p className="mt-5 text-center text-sm opacity-80">{footer}</p>
                </div>
            </div>
        </div>
    )
}