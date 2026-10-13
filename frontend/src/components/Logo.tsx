export function LogoMark() {
    return (
        <span aria-hidden="true" className="relative block h-4 w-4 rounded-[4px] bg-ink">
            <span className="absolute -bottom-1 -right-1 h-[9px] w-[9px] rounded-[3px] border-2 border-page bg-sky-bar" />
        </span>
    )
}

export default function Logo() {
    return (
        <span className="flex items-center gap-2.5 text-[17px] font-bold tracking-[-0.02em]">
            <LogoMark />
            Coauthor
        </span>
    )
}