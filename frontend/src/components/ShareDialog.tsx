import { useEffect, useRef, useState } from 'react'
import { updateDocument, regenerateJoinCode } from '../lib/documents'
import type { Doc } from '../types/document'
import Button from './Button'

interface Props {
    doc: Doc
    onClose: () => void
    onChange: (doc: Doc) => void
}

export default function ShareDialog({ doc, onClose, onChange }: Props) {
    const [copied, setCopied] = useState<'link' | 'code' | null>(null)
    const [error, setError] = useState('')
    const closeRef = useRef<HTMLButtonElement>(null)

    const link = `${window.location.origin}/join/${doc.joinCode}`

    useEffect(() => {
        closeRef.current?.focus()
    }, [])

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [onClose])

    const copy = async (text: string, kind: 'link' | 'code') => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(kind)
            setTimeout(() => setCopied(null), 1500)
        } catch {
            setError('Could not copy. Select the text and copy it by hand.')
        }
    }

    const setMode = async (joinMode: Doc['joinMode']) => {
        setError('')
        try {
            onChange(await updateDocument(doc.id, { joinMode }))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not update')
        }
    }

    const regenerate = async () => {
        if (!window.confirm('Generate a new code? The old link will stop working.')) return
        setError('')
        try {
            onChange(await regenerateJoinCode(doc.id))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not regenerate')
        }
    }

    return (
        <div
            className="fixed inset-0 z-[3000] grid place-items-center bg-black/40 px-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="share-title"
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-xl border border-line bg-surface p-6 text-ink shadow-note"
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 id="share-title" className="text-lg font-bold">
                        Share board
                    </h2>
                    <button
                        ref={closeRef}
                        onClick={onClose}
                        className="rounded-lg px-2 py-1 text-sm text-muted hover:bg-desk hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
                    >
                        Close
                    </button>
                </div>

                {error && (
                    <p
                        role="alert"
                        className="mb-3 rounded-lg border border-danger-line bg-danger-bg px-3 py-2 text-sm text-danger"
                    >
                        {error}
                    </p>
                )}

                <p className="mb-1 text-sm font-medium">Join link</p>
                <div className="mb-4 flex gap-2">
                    <input
                        readOnly
                        value={link}
                        aria-label="Join link"
                        className="min-w-0 flex-1 rounded-lg border border-line bg-desk px-3 py-2 text-sm"
                    />
                    <Button onClick={() => copy(link, 'link')}>{copied === 'link' ? 'Copied' : 'Copy'}</Button>
                </div>

                <p className="mb-1 text-sm font-medium">Join code</p>
                <div className="mb-5 flex items-center gap-3">
                    <span className="rounded-lg border border-line bg-desk px-3 py-2 font-mono text-sm tracking-widest">
                        {doc.joinCode}
                    </span>
                    <button
                        onClick={() => copy(doc.joinCode, 'code')}
                        className="text-sm font-medium text-accent hover:underline"
                    >
                        {copied === 'code' ? 'Copied' : 'Copy'}
                    </button>
                    <button onClick={regenerate} className="ml-auto text-sm text-muted hover:text-ink">
                        New code
                    </button>
                </div>

                <p className="mb-2 text-sm font-medium">When guests join</p>
                <div className="space-y-3 text-sm">
                    <label className="flex items-start gap-2">
                        <input
                            type="radio"
                            name="joinMode"
                            checked={doc.joinMode === 'open'}
                            onChange={() => setMode('open')}
                            className="mt-1 accent-accent"
                        />
                        <span>
                            Let them in right away
                            <span className="block text-xs text-muted">Anyone with the code can edit.</span>
                        </span>
                    </label>
                    <label className="flex items-start gap-2">
                        <input
                            type="radio"
                            name="joinMode"
                            checked={doc.joinMode === 'approval'}
                            onChange={() => setMode('approval')}
                            className="mt-1 accent-accent"
                        />
                        <span>
                            I approve each guest
                            <span className="block text-xs text-muted">
                                You get a prompt while the board is open.
                            </span>
                        </span>
                    </label>
                </div>
            </div>
        </div>
    )
}