import { useState } from 'react'
import { updateDocument, regenerateJoinCode } from '../lib/documents'
import type { Doc } from '../types/document'

interface Props {
    doc: Doc
    onClose: () => void
    onChange: (doc: Doc) => void
}

export default function ShareDialog({ doc, onClose, onChange }: Props) {
    const [copied, setCopied] = useState<'link' | 'code' | null>(null)
    const [error, setError] = useState('')

    const link = `${window.location.origin}/join/${doc.joinCode}`

    const copy = async (text: string, kind: 'link' | 'code') => {
        await navigator.clipboard.writeText(text)
        setCopied(kind)
        setTimeout(() => setCopied(null), 1500)
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
            className="fixed inset-0 z-10 flex items-center justify-center bg-black/30 px-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-medium">Share document</h2>
                    <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-900">
                        Close
                    </button>
                </div>

                {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

                <p className="mb-1 text-sm text-gray-700">Join link</p>
                <div className="mb-4 flex gap-2">
                    <input
                        readOnly
                        value={link}
                        className="min-w-0 flex-1 rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
                    />
                    <button
                        onClick={() => copy(link, 'link')}
                        className="rounded bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700"
                    >
                        {copied === 'link' ? 'Copied' : 'Copy'}
                    </button>
                </div>

                <p className="mb-1 text-sm text-gray-700">Join code</p>
                <div className="mb-4 flex items-center gap-2">
                    <span className="rounded border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-sm tracking-widest">
                        {doc.joinCode}
                    </span>
                    <button
                        onClick={() => copy(doc.joinCode, 'code')}
                        className="text-sm text-indigo-600 hover:underline"
                    >
                        {copied === 'code' ? 'Copied' : 'Copy'}
                    </button>
                    <button
                        onClick={regenerate}
                        className="ml-auto text-sm text-gray-500 hover:text-gray-900"
                    >
                        New code
                    </button>
                </div>

                <p className="mb-2 text-sm text-gray-700">When guests join</p>
                <div className="space-y-2 text-sm">
                    <label className="flex items-start gap-2">
                        <input
                            type="radio"
                            checked={doc.joinMode === 'open'}
                            onChange={() => setMode('open')}
                            className="mt-1"
                        />
                        <span>
                            Let them in right away
                            <span className="block text-xs text-gray-500">Anyone with the code can edit.</span>
                        </span>
                    </label>
                    <label className="flex items-start gap-2">
                        <input
                            type="radio"
                            checked={doc.joinMode === 'approval'}
                            onChange={() => setMode('approval')}
                            className="mt-1"
                        />
                        <span>
                            I approve each guest
                            <span className="block text-xs text-gray-500">
                                You get a prompt while the document is open.
                            </span>
                        </span>
                    </label>
                </div>
            </div>
        </div>
    )
}