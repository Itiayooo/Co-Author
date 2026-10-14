const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

// Starts the backend if a free host has put it to sleep
export function wakeServer() {
    fetch(`${API_URL}/health`).catch(() => { })
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Something went wrong')
    return data
}