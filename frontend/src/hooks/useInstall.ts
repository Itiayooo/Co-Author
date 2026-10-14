import { useEffect, useState } from 'react'

interface InstallPromptEvent extends Event {
    prompt: () => Promise<void>
}

export function useInstall() {
    const [event, setEvent] = useState<InstallPromptEvent | null>(null)

    useEffect(() => {
        const onPrompt = (e: Event) => {
            e.preventDefault()
            setEvent(e as InstallPromptEvent)
        }
        const onInstalled = () => setEvent(null)

        window.addEventListener('beforeinstallprompt', onPrompt)
        window.addEventListener('appinstalled', onInstalled)
        return () => {
            window.removeEventListener('beforeinstallprompt', onPrompt)
            window.removeEventListener('appinstalled', onInstalled)
        }
    }, [])

    const install = async () => {
        if (!event) return
        await event.prompt()
        setEvent(null)
    }

    return { canInstall: event !== null, install }
}