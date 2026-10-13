import { Extension } from '@tiptap/react'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import type { Transaction } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { ySyncPluginKey } from '@tiptap/y-tiptap'

// top-level blocks that carry an author
const TYPES = ['paragraph', 'heading', 'bulletList', 'orderedList', 'blockquote', 'codeBlock']

export interface AuthorshipOptions {
    name: string
    color: string
    onBlocked?: (author: string) => void
}

// changes that came from other people through Yjs
const isRemote = (tr: Transaction) => !!tr.getMeta(ySyncPluginKey)?.isChangeOrigin

// returns the author whose block this change would alter, or null if it is safe
function foreignBlockChanged(tr: Transaction, me: string): string | null {
    let blockedBy: string | null = null
    tr.before.forEach((node, offset) => {
        if (blockedBy) return
        const author = node.attrs.authorName as string | null
        if (!author || author === me) return
        const kept = tr.doc.nodeAt(tr.mapping.map(offset, 1))
        if (!kept || !kept.eq(node)) blockedBy = author
    })
    return blockedBy
}

export const Authorship = Extension.create<AuthorshipOptions>({
    name: 'authorship',

    addOptions() {
        return { name: 'Guest', color: '#4f46e5', onBlocked: undefined }
    },

    addGlobalAttributes() {
        return [
            {
                types: TYPES,
                attributes: {
                    // keepOnSplit false: a block made with Enter belongs to whoever pressed it
                    authorName: { default: null, keepOnSplit: false, rendered: false },
                    authorColor: { default: null, keepOnSplit: false, rendered: false },
                },
            },
        ]
    },

    addProseMirrorPlugins() {
        const { name, color, onBlocked } = this.options

        return [
            // 1. stamp new blocks with the local user
            new Plugin({
                key: new PluginKey('authorship-claim'),
                appendTransaction(transactions, _oldState, newState) {
                    if (!transactions.some((tr) => tr.docChanged)) return null
                    if (transactions.some(isRemote)) return null

                    let tr = newState.tr
                    let changed = false
                    newState.doc.forEach((node, offset) => {
                        if (TYPES.includes(node.type.name) && !node.attrs.authorName) {
                            tr = tr.setNodeMarkup(offset, undefined, {
                                ...node.attrs,
                                authorName: name,
                                authorColor: color,
                            })
                            changed = true
                        }
                    })
                    return changed ? tr : null
                },
            }),

            // 2. block local edits to other people's lines
            new Plugin({
                key: new PluginKey('authorship-guard'),
                filterTransaction(tr) {
                    if (!tr.docChanged || isRemote(tr)) return true
                    const author = foreignBlockChanged(tr, name)
                    if (author) {
                        onBlocked?.(author)
                        return false
                    }
                    return true
                },
            }),

            // 3. draw a name tag when the author changes (empty lines get none)
            new Plugin({
                key: new PluginKey('authorship-labels'),
                props: {
                    decorations(state) {
                        const decorations: Decoration[] = []
                        let previous: string | null = null

                        state.doc.forEach((node, offset) => {
                            const author = node.attrs.authorName as string | null
                            if (!author || !node.textContent.trim()) return

                            if (author !== previous) {
                                const dot = (node.attrs.authorColor as string | null) ?? 'currentColor'
                                decorations.push(
                                    Decoration.widget(
                                        offset,
                                        () => {
                                            const el = document.createElement('div')
                                            el.className = 'author-label'
                                            el.contentEditable = 'false'
                                            el.textContent = author
                                            el.style.setProperty('--author', dot)
                                            return el
                                        },
                                        { side: -1, key: `author-${offset}-${author}-${dot}` }
                                    )
                                )
                            }
                            previous = author
                        })

                        return DecorationSet.create(state.doc, decorations)
                    },
                },
            }),
        ]
    },
})