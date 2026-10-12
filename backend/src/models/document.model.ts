import { Schema, model, Types } from 'mongoose'

export interface IDocument {
    title: string
    owner: Types.ObjectId
    joinCode: string
    joinMode: 'open' | 'approval'
    state?: Buffer
}

const documentSchema = new Schema<IDocument>(
    {
        title: { type: String, default: 'Untitled doc', trim: true },
        owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        joinCode: { type: String, required: true, unique: true },
        joinMode: { type: String, enum: ['open', 'approval'], default: 'open' },
        state: { type: Buffer },
    },
    { timestamps: true }
)

export const Document = model<IDocument>('Document', documentSchema)