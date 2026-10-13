import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const base =
    'group inline-flex items-center justify-center gap-2 rounded-full border font-semibold tracking-[-0.01em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60'

const variants: Record<Variant, string> = {
    primary: 'border-transparent bg-accent text-accent-ink hover:bg-accent-hover',
    ghost: 'border-line bg-transparent text-ink hover:border-ink/25 hover:bg-desk',
}

const sizes: Record<Size, string> = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-5 text-[15px]',
    lg: 'h-[46px] px-[22px] text-[15px]',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', extra = '') {
    return `${base} ${variants[variant]} ${sizes[size]} ${extra}`.trim()
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant
    size?: Size
}

export default function Button({ variant = 'primary', size = 'md', className = '', ...props }: Props) {
    return <button {...props} className={buttonClass(variant, size, className)} />
}