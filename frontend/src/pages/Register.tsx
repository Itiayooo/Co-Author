import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthShell from '../components/AuthShell'
import TextField from '../components/TextField'
import Button from '../components/Button'

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
        <AuthShell
            title="Create your account"
            subtitle="Start a board and share its code with friends."
            art="register"
            footer={
                <>
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-ink hover:underline">
                        Log in
                    </Link>
                </>
            }
        >
            <form onSubmit={handleSubmit}>
                {error && (
                    <p
                        role="alert"
                        className="mb-4 rounded-lg border border-danger-line bg-danger-bg px-3 py-2 text-sm text-danger"
                    >
                        {error}
                    </p>
                )}
                <TextField
                    label="Name"
                    required
                    maxLength={40}
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <TextField
                    label="Email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                    label="Password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="submit" disabled={submitting} className="mt-1 w-full">
                    {submitting ? 'Creating...' : 'Create account'}
                </Button>
            </form>
        </AuthShell>
    )
}