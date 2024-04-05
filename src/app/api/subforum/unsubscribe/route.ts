import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubforumSubscriptionValidator } from "@/lib/validators/subforum";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const session = await getAuthSession()

        if (!session?.user) {
            return new Response('Unauthorized', {status: 401})
        }

        const body = await req.json()

        const { subforumId } = SubforumSubscriptionValidator.parse(body)

        const subscriptionExists = await db.subscription.findFirst({
            where: {
                subforumId,
                userId: session.user.id
            },
        })

        if (!subscriptionExists) {
            return new Response('You are not subscribed to this subforum', {status: 400})
        }

        //check if user is the owner
        const subforum = await db.subforum.findFirst({
            where: {
                id: subforumId,
                creatorId: session.user.id
            },
        })

        if (subforum) {
            return new Response("You can unsubscribe your subforum", {status: 400})
        }

        await db.subscription.delete({
            where: {
                userId_subforumId: {
                    subforumId,
                    userId: session.user.id,
                }
            }
        })

        return new Response(subforumId)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(error.message, {status: 422})
        }

        return new Response('Could not unsubscribe subforum', {status: 500})
    }
}