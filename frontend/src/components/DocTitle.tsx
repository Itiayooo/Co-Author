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
        <div className="flex items-center gap-3">
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur()
                }}
                aria-label="Document title"
                className="w-56 rounded px-2 py-1 text-sm font-medium outline-none hover:bg-gray-100 focus:bg-gray-100"
            />
            <span className="text-xs text-gray-400">{stateText[state]}</span>
        </div>
    )
}