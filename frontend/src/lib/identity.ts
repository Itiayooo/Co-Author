// a stable id for this browser, so a guest keeps their name after a refresh
export function getGuestKey() {
    try {
        let key = localStorage.getItem('guestKey')
        if (!key) {
            key =
                typeof crypto.randomUUID === 'function'
                    ? crypto.randomUUID()
                    : Math.random().toString(36).slice(2) + Date.now().toString(36)
            localStorage.setItem('guestKey', key)
        }
        return key
    } catch {
        return undefined
    }
}