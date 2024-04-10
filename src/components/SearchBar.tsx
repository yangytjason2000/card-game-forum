"use client";

import { FC, useCallback, useEffect, useRef, useState } from "react";
import {
	Command,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandEmpty,
} from "./ui/Command";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Prisma, Post, Subforum } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import { Users } from "lucide-react";
import debounce from "lodash.debounce";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";

interface SearchBarProps {}

const SearchBar: FC<SearchBarProps> = ({}) => {
	const [input, setInput] = useState<string>("");
	const [searchBarPlaceholder, setSearchBarPlaceholder] =
		useState<string>("Search posts...");
	const [currentSubforum, setCurrentSubforum] = useState<string>("");

	const {
		data: queryResults,
		refetch,
		isFetched,
		isFetching,
	} = useQuery({
		queryFn: async () => {
			if (!input) return [];
			const { data } = await axios.get(
				`/api/search?q=${input}&subforum=${currentSubforum}`
			);
			return data as (Post & {
				subforum: Subforum;
				_count: Prisma.PostCountOutputType;
			})[];
		},
		queryKey: ["search-query"],
		enabled: false,
	});

	const request = debounce(() => {
		refetch();
	}, 300);

	const debounceRequest = useCallback(() => {
		request();
	}, []);

	const router = useRouter();

	const commandRef = useRef<HTMLDivElement>(null);

	useOnClickOutside(commandRef, () => {
		setInput("");
	});

	const pathname = usePathname();
	useEffect(() => {
		setInput("");
		const pathnameArray = pathname.split("/");
		const cIndex = pathnameArray.indexOf("c");
		if (cIndex >= 0 && cIndex + 1 < pathnameArray.length) {
			const subforumName = pathnameArray[cIndex + 1];
			setSearchBarPlaceholder("Search posts in c/" + subforumName + "...");
			setCurrentSubforum(subforumName);
		} else {
			setSearchBarPlaceholder("Search posts...");
			setCurrentSubforum("");
		}
	}, [pathname]);

	return (
		<Command
			ref={commandRef}
			className="relative rounded-lg border max-w-lg z-50 overflow-visible"
		>
			<CommandInput
				value={input}
				onValueChange={(text) => {
					setInput(text);
					debounceRequest();
				}}
				className="outline-none border-none focus:border-none focus:outline-none ring-0"
				placeholder={searchBarPlaceholder}
			></CommandInput>

			{input.length > 0 && (
				<CommandList className="absolute bg-white top-full inset-x-0 shadow rounded-b-md">
					{isFetched && <CommandEmpty>No results found.</CommandEmpty>}
					{(queryResults?.length ?? 0) > 0 ? (
						<CommandGroup heading="posts">
							{queryResults?.map((post) => (
								<CommandItem
									key={post.id}
									value={`${post.title}`}
								>
									<Users className="mr-2 h-4 w-4" />
									<a
										href={`/c/${post.subforum.name}/post/${post.id}`}
										onClick={(e) => {
											e.preventDefault();
											router.push(`/c/${post.subforum.name}/post/${post.id}`);
											router.refresh();
										}}
									>
										c/{post.subforum.name + "/" + post.title}
									</a>
								</CommandItem>
							))}
						</CommandGroup>
					) : null}
				</CommandList>
			)}
		</Command>
	);
};

export default SearchBar;
