import { useEffect, useState } from 'react'
import type { Awareness } from 'y-protocols/awareness'

export interface PresenceUser {
    clientId: number
    name: string
    color: string
}

export function usePresence(awareness: Awareness | null) {
    const [users, setUsers] = useState<PresenceUser[]>([])

    useEffect(() => {
        if (!awareness) return

        const update = () => {
            const list: PresenceUser[] = []
            awareness.getStates().forEach((state, clientId) => {
                if (state.user) {
                    list.push({ clientId, name: state.user.name, color: state.user.color })
                }
            })
            setUsers(list)
        }

        update()
        awareness.on('change', update)
        return () => awareness.off('change', update)
    }, [awareness])

    return users
}