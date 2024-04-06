import { INFINITE_SCROLLING_PAGIINATION_RESULTS } from '@/config';
import { getAuthSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import MiniCreatePost from '@/components/MiniCreatePost';
import PostFeed from '@/components/PostFeed';

interface pageProps {
  params: {
    slug: string
  }
}

const page = async ({params}: pageProps) => {
    const { slug } = params;

    const session = await getAuthSession()

    const subforum = await db.subforum.findFirst({
        where: { name: slug },
        include: {
            posts: {
                include: {
                    author: true,
                    votes: true,
                    comments: true,
                    subforum: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },

                take: INFINITE_SCROLLING_PAGIINATION_RESULTS
            }
        }
    })

    if (!subforum) return notFound()

    return <>
        <h1 className='font-bold text-3xl md:text-4xl h-14'>
            c/{subforum.name}
        </h1>
        <MiniCreatePost session={session} />
        <PostFeed initialPosts={subforum.posts} subforumName={subforum.name}/>
    </>
}

export default page