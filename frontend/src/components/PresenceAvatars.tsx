import type { PresenceUser } from '../hooks/usePresence'

const MAX_SHOWN = 4

const initials = (name: string) =>
    name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

interface Props {
    users: PresenceUser[]
    selfId?: number
}

export default function PresenceAvatars({ users, selfId }: Props) {
    const shown = users.slice(0, MAX_SHOWN)
    const extra = users.length - shown.length

    return (
        <div className="flex items-center">
            {shown.map((u) => (
                <div
                    key={u.clientId}
                    title={u.clientId === selfId ? `${u.name} (you)` : u.name}
                    style={{ backgroundColor: u.color }}
                    className="-ml-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface text-xs font-medium text-white first:ml-0"
                >
                    {initials(u.name)}
                </div>
            ))}
            {extra > 0 && (
                <div className="-ml-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-gray-200 text-xs font-medium text-gray-600">
                    +{extra}
                </div>
            )}
        </div>
    )
}