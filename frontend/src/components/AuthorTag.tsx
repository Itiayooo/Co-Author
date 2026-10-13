interface Props {
    name: string
    color: string
}

export default function AuthorTag({ name, color }: Props) {
    return (
        <div className="mt-2.5 flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase leading-snug tracking-[0.06em] opacity-70 first:mt-0">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
            {name}
        </div>
    )
}