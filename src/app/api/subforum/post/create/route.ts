import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostValidator } from "@/lib/validators/post";
import { SubforumSubscriptionValidator } from "@/lib/validators/subforum";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const session = await getAuthSession()

        if (!session?.user) {
            return new Response('Unauthorized', {status: 401})
        }

        const body = await req.json()

        const { subforumId, title, content } = PostValidator.parse(body)

        const subscriptionExists = await db.subscription.findFirst({
            where: {
                subforumId,
                userId: session.user.id
            },
        })

        if (!subscriptionExists) {
            return new Response('Subscribed to post', {status: 400})
        }

        await db.post.create({
            data: {
                title,
                content,
                authorId: session.user.id,
                subforumId
            }
        })

        return new Response('OK')
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(error.message, {status: 422})
        }

        return new Response('Could not create post at this time, please try again later', {status: 500})
    }
}