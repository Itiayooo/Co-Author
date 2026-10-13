import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AppHeader() {
    const { user, logout } = useAuth()

    return (
        <header className="flex h-14 items-center justify-between border-b border-line bg-surface px-4 sm:px-6">
            <Link to="/" className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-sm font-bold text-white">
                    C
                </span>
                <span className="font-semibold">Coauthor</span>
            </Link>
            <div className="flex items-center gap-2 text-sm">
                <span className="hidden text-muted sm:inline">{user?.name}</span>
                <button
                    onClick={logout}
                    className="rounded-lg px-3 py-1.5 font-medium hover:bg-desk focus-visible:outline-2 focus-visible:outline-accent"
                >
                    Log out
                </button>
            </div>
        </header>
    )
}