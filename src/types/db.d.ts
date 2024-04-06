import type { Post, User, Vote, Comment, Subforum } from '@prisma/client'

export type ExtendedPost = Post & {
  subforum: Subforum
  votes: Vote[]
  author: User
  comments: Comment[]
}


