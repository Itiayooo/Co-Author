import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthShell from '../components/AuthShell'
import TextField from '../components/TextField'
import Button from '../components/Button'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setSubmitting(true)
        try {
            await login(email, password)
            navigate('/')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AuthShell
            title="Welcome back"
            subtitle="Log in to your boards."
            art="login"
            footer={
                <>
                    New here?{' '}
                    <Link to="/register" className="font-semibold text-ink hover:underline">
                        Create an account
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
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="submit" disabled={submitting} className="mt-1 w-full">
                    {submitting ? 'Logging in...' : 'Log in'}
                </Button>
            </form>
        </AuthShell>
    )
}