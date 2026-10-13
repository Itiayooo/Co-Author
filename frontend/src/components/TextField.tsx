import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
    label: string
}

export default function TextField({ label, className = '', ...props }: Props) {
    const id = useId()
    return (
        <div className="mb-4">
            <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold">
                {label}
            </label>
            <input
                id={id}
                {...props}
                className={`h-[46px] w-full rounded-xl border border-line bg-surface px-4 text-base text-ink outline-none transition-[border-color,box-shadow] placeholder:text-muted hover:border-ink/30 focus:border-ink focus:ring-4 focus:ring-ink/10 ${className}`}
            />
        </div>
    )
}