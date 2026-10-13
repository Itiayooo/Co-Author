import { useEffect } from 'react'

export function useInert(ref: { current: HTMLElement | null }, inert: boolean) {
    useEffect(() => {
        if (ref.current) ref.current.inert = inert
    }, [ref, inert])
}