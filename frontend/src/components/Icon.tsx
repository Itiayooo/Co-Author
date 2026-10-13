interface Props {
    d: string
    size?: number
    strokeWidth?: number
}

export default function Icon({ d, size = 16, strokeWidth = 2 }: Props) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d={d} />
        </svg>
    )
}