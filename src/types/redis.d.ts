import { Vote } from "@prisma/client"

export type CachedPost = {
    id: string,
    title: string,
    authorUsername: string,
    content: string,
    currentVote: VoteTyle | null
    createdAt: Date
}