export interface Doc {
    id: string
    title: string
    joinCode: string
    joinMode: 'open' | 'approval'
    createdAt: string
    updatedAt: string
}