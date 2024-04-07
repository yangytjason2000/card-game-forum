import { INFINITE_SCROLLING_PAGIINATION_RESULTS } from "@/config"
import { db } from "@/lib/db"
import PostFeed from "./PostFeed"
import { getAuthSession } from "@/lib/auth"

const CustomFeed = async () => {
    const session = await getAuthSession()

    const followedCommunities = await db.subscription.findMany({
        where: {
            userId: session?.user.id
        },
        include: {
            subforum: true
        }
    })
    const posts = await db.post.findMany({
        where: {
            subforum: {
                name: {
                    in: followedCommunities.map(({subforum})=>subforum.id),
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            votes: true,
            author: true,
            comments: true,
            subforum: true,
        },
        take: INFINITE_SCROLLING_PAGIINATION_RESULTS,
    })

    return <PostFeed initialPosts={posts}/>
}

export default CustomFeed