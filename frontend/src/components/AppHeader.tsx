import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

export default function AppHeader() {
    const { user, logout } = useAuth()

    return (
        <header className="flex h-14 items-center justify-between border-b border-line bg-page px-4 sm:px-6">
            <Link to="/" aria-label="Coauthor home">
                <Logo />
            </Link>
            <div className="flex items-center gap-2 text-sm">
                <span className="hidden text-muted sm:inline">{user?.name}</span>
                <button
                    onClick={logout}
                    className="rounded-full px-3.5 py-1.5 font-medium text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-ink"
                >
                    Log out
                </button>
            </div>
        </header>
    )
}