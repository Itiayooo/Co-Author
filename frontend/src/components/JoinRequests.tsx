import type { JoinRequest } from '../hooks/useCollabDoc'
import Button from './Button'

interface Props {
    requests: JoinRequest[]
    onRespond: (id: string, accept: boolean) => void
}

export default function JoinRequests({ requests, onRespond }: Props) {
    return (
        <div aria-live="polite" className="fixed right-4 top-4 z-[2000] w-72 space-y-2">
            {requests.map((req) => (
                <div
                    key={req.id}
                    className="rounded-xl border border-line bg-surface p-3 text-sm text-ink shadow-note"
                >
                    <p className="mb-3">
                        <span className="font-semibold">{req.name}</span> wants to join
                    </p>
                    <div className="flex gap-2">
                        <Button onClick={() => onRespond(req.id, true)} className="px-3 py-1.5">
                            Accept
                        </Button>
                        <button
                            onClick={() => onRespond(req.id, false)}
                            className="rounded-lg border border-line px-3 py-1.5 font-medium hover:bg-desk focus-visible:outline-2 focus-visible:outline-accent"
                        >
                            Decline
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}