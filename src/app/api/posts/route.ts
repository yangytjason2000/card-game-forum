import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const session = await getAuthSession();

  let followedCommunitiesIds: string[] = [];

  if (session) {
    const followedCommunities = await db.subscription.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        subforum: true,
      },
    });

    followedCommunitiesIds = followedCommunities.map(
      ({ subforum }) => subforum.id
    );
  }
  try {
    const { limit, page, subforumName } = z
      .object({
        limit: z.string(),
        page: z.string(),
        subforumName: z.string().nullish().optional(),
      })
      .parse({
        subforumName: url.searchParams.get("subforumName"),
        limit: url.searchParams.get("limit"),
        page: url.searchParams.get("page"),
      });

    let whereClause = {};

    if (subforumName) {
      whereClause = {
        subforum: {
          name: subforumName,
        },
      };
    } else if (session) {
      whereClause = {
        subforum: {
          id: {
            in: followedCommunitiesIds,
          },
        },
      };
    }

    const posts = await db.post.findMany({
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      orderBy: {
        createdAt: "desc",
      },
      include: {
        subforum: true,
        votes: true,
        author: true,
        comments: true,
      },
      where: whereClause,
    });

    return new Response(JSON.stringify(posts));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response("Could not fetch more posts ", {
      status: 500,
    });
  }
}
