import type { JoinRequest } from '../hooks/useCollabDoc'

interface Props {
    requests: JoinRequest[]
    onRespond: (id: string, accept: boolean) => void
}

export default function JoinRequests({ requests, onRespond }: Props) {
    if (requests.length === 0) return null

    return (
        <div className="fixed right-4 top-14 z-10 w-72 space-y-2">
            {requests.map((req) => (
                <div key={req.id} className="rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-sm">
                    <p className="mb-2">
                        <span className="font-medium">{req.name}</span> wants to join
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onRespond(req.id, true)}
                            className="rounded bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-700"
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => onRespond(req.id, false)}
                            className="rounded border border-gray-300 px-3 py-1 text-gray-700 hover:bg-gray-50"
                        >
                            Decline
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}