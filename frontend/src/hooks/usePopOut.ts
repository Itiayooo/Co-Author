import { useCallback, useEffect, useState } from 'react'

interface PipApi {
    requestWindow: (options?: { width?: number; height?: number }) => Promise<Window>
}
type PipHost = Window & { documentPictureInPicture?: PipApi }

// the small window needs the same CSS as the page
function copyStyles(target: Window) {
    Array.from(document.styleSheets).forEach((sheet) => {
        try {
            const css = Array.from(sheet.cssRules)
                .map((rule) => rule.cssText)
                .join('')
            const style = target.document.createElement('style')
            style.textContent = css
            target.document.head.appendChild(style)
        } catch {
            // a sheet we can't read, link it instead
            if (sheet.href) {
                const link = target.document.createElement('link')
                link.rel = 'stylesheet'
                link.href = sheet.href
                target.document.head.appendChild(link)
            }
        }
    })
}

// opens a note in a small always-on-top window (Chrome and Edge on desktop)
export function usePopOut(title: string) {
    const [win, setWin] = useState<Window | null>(null)
    const supported = 'documentPictureInPicture' in window

    const open = useCallback(async () => {
        const api = (window as PipHost).documentPictureInPicture
        if (!api) return
        const pip = await api.requestWindow({ width: 340, height: 400 })
        copyStyles(pip)
        pip.document.title = title
        pip.addEventListener('pagehide', () => setWin(null))
        setWin(pip)
    }, [title])

    const close = useCallback(() => win?.close(), [win])

    useEffect(() => () => win?.close(), [win])

    return { win, supported, open, close }
}