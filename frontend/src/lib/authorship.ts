import { Extension } from '@tiptap/react'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { ySyncPluginKey } from '@tiptap/y-tiptap'

// top-level blocks that carry an author
const TYPES = ['paragraph', 'heading', 'bulletList', 'orderedList', 'blockquote', 'codeBlock']

export interface AuthorshipOptions {
    name: string
    color: string
    alwaysShow: boolean
}

export const Authorship = Extension.create<AuthorshipOptions>({
    name: 'authorship',

    addOptions() {
        return { name: 'Guest', color: '#4f46e5', alwaysShow: false }
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
        const { name, color, alwaysShow } = this.options

        return [
            // 1. stamp new blocks with the local user
            new Plugin({
                key: new PluginKey('authorship-claim'),
                appendTransaction(transactions, _oldState, newState) {
                    if (!transactions.some((tr) => tr.docChanged)) return null
                    // ignore changes that came from other people
                    if (transactions.some((tr) => tr.getMeta(ySyncPluginKey)?.isChangeOrigin)) return null

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

            // 2. draw the name label when the author changes
            new Plugin({
                key: new PluginKey('authorship-labels'),
                props: {
                    decorations(state) {
                        const authors = new Set<string>()
                        state.doc.forEach((node) => {
                            if (node.attrs.authorName) authors.add(node.attrs.authorName + node.attrs.authorColor)
                        })
                        if (!alwaysShow && authors.size < 2) return DecorationSet.empty

                        const decorations: Decoration[] = []
                        let previous = ''
                        state.doc.forEach((node, offset) => {
                            const author = node.attrs.authorName as string | null
                            if (!author) return
                            const color = (node.attrs.authorColor as string | null) ?? 'currentColor'
                            const key = author + color
                            if (key !== previous) {
                                decorations.push(
                                    Decoration.widget(
                                        offset,
                                        () => {
                                            const el = document.createElement('div')
                                            el.className = 'author-label'
                                            el.contentEditable = 'false'
                                            el.textContent = author
                                            el.style.setProperty('--author', color)
                                            return el
                                        },
                                        { side: -1, key: `author-${offset}-${key}` }
                                    )
                                )
                            }
                            previous = key
                        })
                        return DecorationSet.create(state.doc, decorations)
                    },
                },
            }),
        ]
    },
})