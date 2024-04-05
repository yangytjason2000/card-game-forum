import {z} from 'zod'

export const SubforumValidator = z.object({
    name: z.string().min(3).max(21),
})

export const SubforumSubscriptionValidator = z.object({
    SubforumId: z.string()
})

export type CreateSubforumPayload = z.infer<typeof SubforumValidator>
export type SubscribeToSubforumPayload = z.infer<typeof SubforumSubscriptionValidator>