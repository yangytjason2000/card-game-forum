import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import React from "react";
import { format } from "date-fns";
import SubscribeLeaveToggle from "@/components/SubscribeLeaveToggle";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import ToFeedButton from "@/components/ToFeedButton";

const Layout = async ({
	children,
	params: { slug },
}: {
	children: React.ReactNode;
	params: { slug: string };
}) => {
	const session = await getAuthSession();

	const subforum = await db.subforum.findFirst({
		where: { name: slug },
		include: {
			posts: {
				include: {
					author: true,
					votes: true,
				},
			},
		},
	});

	const subscription = !session?.user
		? undefined
		: await db.subscription.findFirst({
				where: {
					subforum: {
						name: slug,
					},
					user: {
						id: session.user.id,
					},
				},
		  });

	const isSubscribed = !!subscription;

	if (!subforum) return notFound();

	const memberCount = await db.subscription.count({
		where: {
			subforum: {
				name: slug,
			},
		},
	});
	return (
		<div className="sm:container max-w-7xl mx-auto h-full pt-12">
			<div>
				<ToFeedButton/>
				<div className="grid grid-cols-1 md:grid-cols-3 gay-y-4 md:gap-x-4 py-6">
					<ul className="flex flex-col col-span-2 space-y-6">{children}</ul>

					<div className="hidden md:block overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last">
						<div className="px-6 py-4">
							<p className="font-semibold py-3">About c/{subforum.name}</p>
						</div>

						<dl className="divide-y divide-gray-100 px-6 py-4 text-sm leading-6 bg-white">
							<div className="flex justify-between gap-x-4 py-3">
								<dt className="text-gray-500">Created</dt>
								<dd className="text-gray-700">
									<time dateTime={subforum.createdAt.toDateString()}>
										{format(subforum.createdAt, "MMMM d, yyyy")}
									</time>
								</dd>
							</div>

							<div className="flex justify-between gap-x-4 py-3">
								<dt className="text-gray-500">Members</dt>
								<dd className="text-gray-700">
									<div className="text-gray-900">{memberCount}</div>
								</dd>
							</div>

							{subforum.creatorId === session?.user.id ? (
								<div className="flex justify-between gap-x-4 py-3">
									<p className="text-gray-500">You created this community</p>
								</div>
							) : null}

							{subforum.creatorId !== session?.user.id ? (
								<SubscribeLeaveToggle
									subforumId={subforum.id}
									subforumName={subforum.name}
									isSubscribed={isSubscribed}
								/>
							) : null}

							{/* {<Link
								className={buttonVariants({
									variant: "outline",
									className: "w-full mb-6",
								})}
								href={`c/${slug}/submit`}
							>
								Create Post
							</Link>} */}
						</dl>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Layout;
