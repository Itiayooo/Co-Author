import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
    label: string
}

export default function TextField({ label, className = '', ...props }: Props) {
    const id = useId()
    return (
        <div className="mb-4">
            <label htmlFor={id} className="mb-1 block text-sm font-medium">
                {label}
            </label>
            <input
                id={id}
                {...props}
                className={`w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-[15px] text-ink outline-none placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/30 ${className}`}
            />
        </div>
    )
}