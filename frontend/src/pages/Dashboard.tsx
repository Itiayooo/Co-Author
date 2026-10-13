import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDocuments, createDocument, deleteDocument } from '../lib/documents'
import type { Doc } from '../types/document'
import AppHeader from '../components/AppHeader'
import BoardCard from '../components/BoardCard'
import Button from '../components/Button'

export default function Dashboard() {
    const navigate = useNavigate()
    const [docs, setDocs] = useState<Doc[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [creating, setCreating] = useState(false)
    const [query, setQuery] = useState('')

    useEffect(() => {
        getDocuments()
            .then(setDocs)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase()
        return q ? docs.filter((d) => d.title.toLowerCase().includes(q)) : docs
    }, [docs, query])

    const handleCreate = async () => {
        setCreating(true)
        try {
            const doc = await createDocument()
            navigate(`/doc/${doc.id}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not create board')
            setCreating(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this board? This cannot be undone.')) return
        try {
            await deleteDocument(id)
            setDocs((prev) => prev.filter((d) => d.id !== id))
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not delete board')
        }
    }

    return (
        <div className="min-h-screen bg-desk">
            <AppHeader />

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
                <div className="mb-6 flex flex-wrap items-center gap-3">
                    <h1 className="mr-auto text-2xl font-bold tracking-tight">Your boards</h1>
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search boards"
                        aria-label="Search boards"
                        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/30 sm:w-56"
                    />
                    <Button onClick={handleCreate} disabled={creating}>
                        {creating ? 'Creating...' : 'New board'}
                    </Button>
                </div>

                {error && (
                    <p
                        role="alert"
                        className="mb-4 rounded-lg border border-danger-line bg-danger-bg px-3 py-2 text-sm text-danger"
                    >
                        {error}
                    </p>
                )}

                {loading ? (
                    <p className="text-sm text-muted">Loading...</p>
                ) : docs.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-line px-6 py-14 text-center">
                        <p className="font-medium">No boards yet</p>
                        <p className="mt-1 text-sm text-muted">
                            Create one and share its code with friends.
                        </p>
                    </div>
                ) : visible.length === 0 ? (
                    <p className="text-sm text-muted">No boards match your search.</p>
                ) : (
                    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {visible.map((doc) => (
                            <BoardCard key={doc.id} doc={doc} onDelete={handleDelete} />
                        ))}
                    </ul>
                )}
            </main>
        </div>
    )
}