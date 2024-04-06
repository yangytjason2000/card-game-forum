import { Vote } from "@prisma/client"

export type CachePost = {
    id: string,
    title: string,
    authorUsername: string,
    content: string,
    currentVote: VoteTyle | null
    createdAt: Date
}