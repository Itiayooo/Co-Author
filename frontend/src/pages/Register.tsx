import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)

        try {
            await register(name, email, password)
            navigate('/')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
                <h1 className="mb-1 text-xl font-medium text-gray-900">
                    Create an account
                </h1>
                <p className="mb-6 text-sm text-gray-500">
                    Get started with Coauthor
                </p>

                {error && (
                    <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                    </p>
                )}

                <label className="mb-1 block text-sm text-gray-700">Name</label>
                <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mb-4 w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-600"
                />

                <label className="mb-1 block text-sm text-gray-700">Email</label>
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mb-4 w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-600"
                />

                <label className="mb-1 block text-sm text-gray-700">Password</label>
                <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mb-6 w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-600"
                />

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                    {submitting ? 'Creating...' : 'Create account'}
                </button>

                <p className="mt-4 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-indigo-600 hover:underline">
                        Log in
                    </Link>
                </p>
            </form>
        </div>
    )
}
