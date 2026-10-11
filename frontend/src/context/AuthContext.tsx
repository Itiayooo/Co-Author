import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { api } from '../lib/api'

interface User {
    id: string
    name: string
    email: string
}

interface AuthResponse {
    token: string
    user: User
}

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (name: string, email: string, password: string) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            setLoading(false)
            return
        }
        api<{ user: User }>('/users/me')
            .then((data) => setUser(data.user))
            .catch(() => localStorage.removeItem('token'))
            .finally(() => setLoading(false))
    }, [])

    const login = async (email: string, password: string) => {
        const data = await api<AuthResponse>('/users/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        })
        localStorage.setItem('token', data.token)
        setUser(data.user)
    }

    const register = async (name: string, email: string, password: string) => {
        const data = await api<AuthResponse>('/users/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        })
        localStorage.setItem('token', data.token)
        setUser(data.user)
    }

    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}