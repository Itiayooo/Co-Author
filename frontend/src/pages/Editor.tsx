import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCollabDoc } from '../hooks/useCollabDoc'
import { usePresence } from '../hooks/usePresence'
import MarkdownEditor from '../components/MarkdownEditor'
import PresenceAvatars from '../components/PresenceAvatars'

const statusText = {
  connecting: 'Connecting...',
  connected: 'Live',
  disconnected: 'Offline',
}

export default function Editor() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const { session, status } = useCollabDoc(id, user?.name ?? 'Anonymous')
  const users = usePresence(session?.awareness ?? null)

  return (
    <div className="flex h-screen flex-col bg-white text-gray-900">
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-2 text-sm">
        <Link to="/" className="text-gray-500 hover:text-gray-900">
          ← Docs
        </Link>
        <div className="flex items-center gap-4">
          <PresenceAvatars users={users} selfId={session?.awareness.clientID} />
          <span className={status === 'connected' ? 'text-green-600' : 'text-gray-400'}>
            {statusText[status]}
          </span>
        </div>
      </header>
      <main className="min-h-0 flex-1 overflow-auto">
        {session && <MarkdownEditor ytext={session.ytext} awareness={session.awareness} />}
      </main>
    </div>
  )
}