import { api } from './api'
import type { Doc } from '../types/document'

export const getDocuments = () =>
    api<{ documents: Doc[] }>('/documents').then((r) => r.documents)

export const createDocument = (title?: string) =>
    api<{ document: Doc }>('/documents', {
        method: 'POST',
        body: JSON.stringify({ title }),
    }).then((r) => r.document)

export const deleteDocument = (id: string) =>
    api<{ message: string }>(`/documents/${id}`, { method: 'DELETE' })

export const getDocument = (id: string) =>
    api<{ document: Doc }>(`/documents/${id}`).then((r) => r.document)

export const updateDocument = (
    id: string,
    data: Partial<Pick<Doc, 'title' | 'joinMode'>>
) =>
    api<{ document: Doc }>(`/documents/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }).then((r) => r.document)

export const regenerateJoinCode = (id: string) =>
    api<{ document: Doc }>(`/documents/${id}/regenerate-code`, {
        method: 'POST',
    }).then((r) => r.document)

export const getDocumentByCode = (code: string) =>
    api<{ document: { id: string; title: string; joinMode: 'open' | 'approval' } }>(
        `/documents/join/${code}`
    ).then((r) => r.document)