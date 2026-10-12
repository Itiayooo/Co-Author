import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function MarkdownPreview({ text }: { text: string }) {
    if (!text.trim()) {
        return <p className="p-6 text-sm text-gray-400">Nothing to preview yet.</p>
    }

    return (
        <article className="prose prose-sm max-w-none p-6">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </article>
    )
}