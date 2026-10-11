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