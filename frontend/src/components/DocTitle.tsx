import { useEffect, useState } from 'react'

interface Props {
    value: string
    onSave: (title: string) => Promise<void>
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

const stateText: Record<SaveState, string> = {
    idle: '',
    saving: 'Saving...',
    saved: 'Saved',
    error: 'Not saved',
}

export default function DocTitle({ value, onSave }: Props) {
    const [title, setTitle] = useState(value)
    const [state, setState] = useState<SaveState>('idle')

    useEffect(() => setTitle(value), [value])

    const commit = async () => {
        const next = title.trim() || 'Untitled doc'
        setTitle(next)
        if (next === value) return
        setState('saving')
        try {
            await onSave(next)
            setState('saved')
        } catch {
            setState('error')
        }
    }

    return (
        <div className="flex items-center gap-2">
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur()
                }}
                aria-label="Board title"
                className="w-32 rounded-md bg-transparent px-2 py-1 text-sm font-semibold outline-none hover:bg-desk focus:bg-desk focus:ring-2 focus:ring-accent/30 sm:w-48"
            />
            <span className="hidden text-xs text-muted sm:inline">{stateText[state]}</span>
        </div>
    )
}