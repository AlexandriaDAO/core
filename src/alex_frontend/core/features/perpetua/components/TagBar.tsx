import React, { useState } from "react";
import { X, Search } from "lucide-react";
import { Badge } from "@/lib/components/badge";
import { Input } from "@/lib/components/input";
import { Skeleton } from "@/lib/components/skeleton";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setTagFilter, clearTagFilter } from "../store/slice";
import { usePopularTags, useTagSearch } from "../hooks/useTags";

export default function TagBar() {
	const dispatch = useAppDispatch();
	const activeTag = useAppSelector((state) => state.valora.tagFilter);
	const { data: popularTags, isLoading } = usePopularTags();
	const [searchPrefix, setSearchPrefix] = useState("");
	const { data: searchResults } = useTagSearch(searchPrefix);

	const handleTagClick = (tag: string) => {
		if (activeTag === tag) {
			dispatch(clearTagFilter());
		} else {
			dispatch(setTagFilter(tag));
		}
	};

	const displayTags = searchPrefix.length > 0 ? (searchResults ?? []) : (popularTags ?? []);

	return (
		<div className="flex flex-col gap-3 animate-fade">
			<div className="relative max-w-sm">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-gray-400" />
				<Input
					type="text"
					value={searchPrefix}
					onChange={(e) => setSearchPrefix(e.target.value)}
					placeholder="Search tags..."
					className="pl-9"
					scale="sm"
					rounded="md"
				/>
			</div>

			{activeTag && (
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground dark:text-gray-400">Filtering by:</span>
					<Badge variant="default" className="text-sm py-1 px-3 dark:bg-primary/30 dark:text-primary">
						{activeTag}
						<button onClick={() => dispatch(clearTagFilter())} className="ml-1.5">
							<X className="h-3.5 w-3.5" />
						</button>
					</Badge>
				</div>
			)}

			{isLoading ? (
				<div className="flex gap-2 flex-wrap">
					{Array.from({ length: 6 }, (_, i) => (
						<Skeleton key={i} className="h-8 w-16 rounded-full" />
					))}
				</div>
			) : displayTags.length === 0 ? (
				<p className="text-sm text-muted-foreground dark:text-gray-400">
					{searchPrefix ? "No tags found." : "No popular tags yet."}
				</p>
			) : (
				<div className="flex gap-2 flex-wrap">
					{displayTags.map((tag) => (
						<Badge
							key={tag}
							variant={activeTag === tag ? "default" : "outline"}
							className={`text-xs py-0.5 px-2.5 cursor-pointer transition-colors ${
								activeTag === tag
									? "dark:bg-primary/30 dark:text-primary dark:hover:bg-primary/40"
									: "bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
							}`}
							onClick={() => handleTagClick(tag)}
						>
							{tag}
						</Badge>
					))}
				</div>
			)}
		</div>
	);
}
