import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDocuments, createDocument, deleteDocument } from '../lib/documents'
import type { Doc } from '../types/document'

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })

export default function Dashboard() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [docs, setDocs] = useState<Doc[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        getDocuments()
            .then(setDocs)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    const handleCreate = async () => {
        setCreating(true)
        try {
            const doc = await createDocument()
            navigate(`/doc/${doc.id}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not create document')
            setCreating(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this document? This cannot be undone.')) return
        try {
            await deleteDocument(id)
            setDocs((prev) => prev.filter((d) => d.id !== id))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not delete document')
        }
    }

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <header className="flex items-center justify-between border-b border-gray-200 px-6 py-3">
                <span className="font-medium">Coauthor</span>
                <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">{user?.name}</span>
                    <button onClick={logout} className="text-indigo-600 hover:underline">
                        Log out
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-3xl px-6 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-xl font-medium">Your documents</h1>
                    <button
                        onClick={handleCreate}
                        disabled={creating}
                        className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {creating ? 'Creating...' : 'New document'}
                    </button>
                </div>

                {error && (
                    <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                    </p>
                )}

                {loading ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                ) : docs.length === 0 ? (
                    <div className="rounded border border-dashed border-gray-300 py-12 text-center text-sm text-gray-500">
                        No documents yet. Create one to get started.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200 rounded border border-gray-200">
                        {docs.map((doc) => (
                            <li key={doc.id} className="flex items-center justify-between px-4 py-3">
                                <Link to={`/doc/${doc.id}`} className="min-w-0 flex-1">
                                    <p className="truncate font-medium hover:text-indigo-600">{doc.title}</p>
                                    <p className="text-xs text-gray-500">
                                        Edited {formatDate(doc.updatedAt)} · Code {doc.joinCode}
                                    </p>
                                </Link>
                                <button
                                    onClick={() => handleDelete(doc.id)}
                                    className="ml-4 text-sm text-gray-400 hover:text-red-600"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </main>
        </div>
    )
}