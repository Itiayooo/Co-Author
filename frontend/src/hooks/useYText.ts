import { useEffect, useState } from 'react'
import type * as Y from 'yjs'

export function useYText(ytext: Y.Text) {
    const [text, setText] = useState(() => ytext.toString())

    useEffect(() => {
        const update = () => setText(ytext.toString())
        update()
        ytext.observe(update)
        return () => ytext.unobserve(update)
    }, [ytext])

    return text
}