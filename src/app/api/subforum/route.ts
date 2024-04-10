import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubforumValidator } from "@/lib/validators/subforum";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const session = await getAuthSession()

        if(!session?.user) {
            return new Response('Not logged in', { status: 401})
        }

        if (session.user.type !== 'ADMIN') {
            return new Response('Unauthorized', {status: 401})
        }

        const body = await req.json()
        const {name} = SubforumValidator.parse(body)

        const subforumExists = await db.subforum.findFirst({
            where: {
                name,
            },
        })

        if (subforumExists) {
            return new Response('Subforum already exists', {status: 409})
        }

        const subforum = await db.subforum.create({
            data: {
                name,
                creatorId: session.user.id,
            },
        })

        await db.subscription.create({
            data: {
                userId: session.user.id,
                subforumId: subforum.id
            },
        })

        return new Response(subforum.name)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(error.message, {status: 422})
        }

        return new Response('Could not create subforum', {status: 500})
    }
}