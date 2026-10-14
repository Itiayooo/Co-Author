import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import HeroStage from '../components/landing/HeroStage'
import { buttonClass } from '../components/Button'
import { wakeServer } from '../lib/api'

const DEMO_CODE = import.meta.env.VITE_DEMO_CODE as string | undefined

const STEPS = [
    { n: '01', title: 'Start a board', text: 'Sign up and open a fresh desk. Add as many notes as you like.' },
    {
        n: '02',
        title: 'Share the code',
        text: 'Send the link or the six letter code. Guests need a name, not an account.',
    },
    {
        n: '03',
        title: 'Write together',
        text: "Everyone types live with their own cursor, and every line carries its author's name.",
    },
]

const FEATURES = [
    { title: 'Live cursors with names', text: 'See who is typing where, as it happens.' },
    {
        title: 'Lines belong to their author',
        text: 'Nobody edits your words by accident. Add your own line right below.',
    },
    {
        title: "Move together, or don't",
        text: 'Drag a note and it moves for everyone. Switch it off to keep your own layout.',
    },
    {
        title: 'Made for your phone too',
        text: 'On small screens notes become a clean list, one tap to open.',
    },
]

const eyebrow =
    'mb-3.5 block font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-muted'
const heading =
    'mb-14 text-[clamp(1.9rem,3.4vw,2.7rem)] font-bold leading-[1.05] tracking-[-0.045em]'

export default function Landing() {
    const navigate = useNavigate()
    const [code, setCode] = useState('')

    const join = (e: FormEvent) => {
        e.preventDefault()
        const c = code.trim().toUpperCase()
        if (c) navigate(`/join/${c}`)
    }

    useEffect(() => {
        wakeServer()
    }, [])

    return (
        <div className="min-h-screen bg-page text-ink">
            <div className="sticky top-0 z-50 border-b border-line bg-navbg backdrop-blur-md backdrop-saturate-150">
                <header className="mx-auto flex max-w-[1120px] items-center justify-between px-5 py-3 min-[900px]:px-6 min-[900px]:py-3.5">
                    <Link to="/" aria-label="Coauthor home">
                        <Logo />
                    </Link>
                    <nav className="flex items-center gap-1.5">
                        <Link
                            to="/login"
                            className="rounded-full px-3.5 py-2 text-sm font-medium text-muted hover:text-ink"
                        >
                            Log in
                        </Link>
                        <Link to="/register" className={buttonClass('primary', 'sm')}>
                            Start a board
                        </Link>
                    </nav>
                </header>
            </div>

            <main>
                <section className="mx-auto grid max-w-[1120px] items-center gap-12 px-5 pb-[72px] pt-12 min-[900px]:grid-cols-[1fr_1.05fr] min-[900px]:gap-16 min-[900px]:px-6 min-[900px]:pb-28 min-[900px]:pt-[88px]">
                    <div>
                        <h1 className="m-0 text-[clamp(2.25rem,4.3vw,3.7rem)] font-semibold leading-[1.04] tracking-[-0.045em]">
                            Write together <span className="text-muted">on sticky notes.</span>
                        </h1>
                        <p className="mb-[34px] mt-[26px] max-w-[38ch] text-[19px] leading-normal tracking-[-0.01em] text-muted">
                            A shared desk where every note is live. Drag them around, fold them away, and write side by
                            side with friends.
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                            <Link to="/register" className={buttonClass('primary', 'lg')}>
                                Start a board
                                <span
                                    aria-hidden="true"
                                    className="transition-transform duration-200 group-hover:translate-x-[3px]"
                                >
                                    &rarr;
                                </span>
                            </Link>
                            {DEMO_CODE && (
                                <Link to={`/join/${DEMO_CODE}`} className={buttonClass('ghost', 'lg')}>
                                    Try the live demo
                                </Link>
                            )}
                        </div>
                        <form
                            onSubmit={join}
                            className="mt-10 flex flex-wrap items-center gap-2.5 border-t border-line pt-6 text-sm text-muted"
                        >
                            <label htmlFor="join-code">Have a code?</label>
                            <input
                                id="join-code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                maxLength={6}
                                placeholder="K7M2QX"
                                autoComplete="off"
                                className="h-9 w-[116px] rounded-full border border-line bg-surface px-3 font-mono text-[13px] font-medium uppercase tracking-[0.14em] text-ink outline-none placeholder:opacity-50 focus:border-ink"
                            />
                            <button type="submit" className={buttonClass('ghost', 'sm', 'h-9')}>
                                Join
                            </button>
                        </form>
                    </div>

                    <HeroStage />
                </section>

                <section className="mx-auto max-w-[1120px] px-5 pb-20 min-[900px]:px-6 min-[900px]:pb-28">
                    <span className={eyebrow}>How it works</span>
                    <h2 className={heading}>Three steps. No setup.</h2>
                    <div className="grid border-t border-line min-[900px]:grid-cols-3">
                        {STEPS.map((s, i) => (
                            <div
                                key={s.n}
                                className={`py-6 min-[900px]:pb-2 min-[900px]:pr-8 ${i > 0
                                    ? 'border-t border-line min-[900px]:border-l min-[900px]:border-t-0 min-[900px]:pl-8'
                                    : ''
                                    }`}
                            >
                                <div className="mb-4 font-mono text-xs font-medium text-muted min-[900px]:mb-11">
                                    {s.n}
                                </div>
                                <h3 className="mb-2 text-xl font-bold tracking-[-0.03em]">{s.title}</h3>
                                <p className="m-0 max-w-[30ch] text-muted">{s.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mx-auto max-w-[1120px] px-5 pb-20 min-[900px]:px-6 min-[900px]:pb-28">
                    <span className={eyebrow}>Details</span>
                    <h2 className={heading}>Small things that matter.</h2>
                    <div className="grid border-t border-line min-[900px]:grid-cols-2">
                        {FEATURES.map((f, i) => (
                            <div
                                key={f.title}
                                className={`border-b border-line py-6 min-[900px]:pb-9 min-[900px]:pt-7 ${i % 2 === 0 ? 'min-[900px]:pr-8' : 'min-[900px]:border-l min-[900px]:pl-8'
                                    }`}
                            >
                                <h3 className="mb-2 text-xl font-bold tracking-[-0.03em]">{f.title}</h3>
                                <p className="m-0 max-w-[36ch] text-muted">{f.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="px-5">
                    <div className="mx-auto mb-14 max-w-[1072px] rounded-[22px] bg-inv-bg px-5 py-16 text-center text-inv-ink min-[900px]:mb-20 min-[900px]:rounded-[28px] min-[900px]:py-[88px]">
                        <h2 className="mb-8 text-[clamp(2rem,4.2vw,3.4rem)] font-bold leading-none tracking-[-0.05em]">
                            Your first board
                            <br />
                            takes ten seconds.
                        </h2>
                        <Link
                            to="/register"
                            className="group inline-flex h-[46px] items-center justify-center gap-2 rounded-full bg-inv-btn px-[22px] text-[15px] font-semibold tracking-[-0.01em] text-inv-btn-ink hover:opacity-90"
                        >
                            Start a board
                            <span
                                aria-hidden="true"
                                className="transition-transform duration-200 group-hover:translate-x-[3px]"
                            >
                                &rarr;
                            </span>
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="px-6 pb-10 text-center font-mono text-xs tracking-[0.02em] text-muted">
                Built with React, Tiptap, Yjs and Socket.io.
            </footer>
        </div>
    )
}