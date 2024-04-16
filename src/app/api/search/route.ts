import { db } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  const subforumName = url.searchParams.get("subforum");

  if (!q) return new Response("Invalid query", { status: 400 });

  let whereClause = {};
  if (subforumName) {
    whereClause = {
      title: {
        contains: q,
      },
      subforum: {
        name: subforumName,
      },
    };
  } else {
    whereClause = {
      title: {
        contains: q,
      },
    };
  }
  const results = await db.post.findMany({
    where: whereClause,
    orderBy : {
      createdAt: "desc"
    },
    include: {
      subforum: true,
      _count: true,
    },
    take: 5,
  });

  return new Response(JSON.stringify(results));
}
