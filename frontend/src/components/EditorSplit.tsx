import { useState } from 'react'
import type * as Y from 'yjs'
import type { Awareness } from 'y-protocols/awareness'
import MarkdownEditor from './MarkdownEditor'
import MarkdownPreview from './MarkdownPreview'
import { useYText } from '../hooks/useYText'

interface Props {
    ytext: Y.Text
    awareness: Awareness
}

export default function EditorSplit({ ytext, awareness }: Props) {
    const [tab, setTab] = useState<'edit' | 'preview'>('edit')
    const text = useYText(ytext)

    const tabClass = (active: boolean) =>
        `flex-1 py-2 text-sm ${active ? 'border-b-2 border-indigo-600 font-medium text-gray-900' : 'text-gray-500'
        }`

    return (
        <div className="flex h-full flex-col">
            <div className="flex border-b border-gray-200 md:hidden">
                <button onClick={() => setTab('edit')} className={tabClass(tab === 'edit')}>
                    Edit
                </button>
                <button onClick={() => setTab('preview')} className={tabClass(tab === 'preview')}>
                    Preview
                </button>
            </div>

            <div className="grid min-h-0 flex-1 grid-rows-1 md:grid-cols-2">
                <div
                    className={`min-h-0 overflow-auto md:block md:border-r md:border-gray-200 ${tab === 'edit' ? '' : 'hidden'
                        }`}
                >
                    <MarkdownEditor ytext={ytext} awareness={awareness} />
                </div>
                <div className={`min-h-0 overflow-auto md:block ${tab === 'preview' ? '' : 'hidden'}`}>
                    <MarkdownPreview text={text} />
                </div>
            </div>
        </div>
    )
}