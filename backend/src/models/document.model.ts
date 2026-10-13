import { Schema, model, Types } from 'mongoose'

export interface IParticipant {
    key: string
    name: string
    label: string
}

const participantSchema = new Schema<IParticipant>(
    {
        key: { type: String, required: true },
        name: { type: String, required: true },
        label: { type: String, required: true },
    },
    { _id: false }
)

export interface IDocument {
    title: string
    owner: Types.ObjectId
    joinCode: string
    joinMode: 'open' | 'approval'
    participants: IParticipant[]
    state?: Buffer
}

const documentSchema = new Schema<IDocument>(
    {
        title: { type: String, default: 'Untitled doc', trim: true },
        owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        joinCode: { type: String, required: true, unique: true },
        joinMode: { type: String, enum: ['open', 'approval'], default: 'open' },
        participants: { type: [participantSchema], default: [] },
        state: { type: Buffer },
    },
    { timestamps: true }
)

export const Document = model<IDocument>('Document', documentSchema)