import React, { useMemo, useCallback, useEffect, useRef } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useShelvesByTag, useTagShelfCount } from "../hooks/useTags";
import { Badge } from "@/lib/components/badge";
import ShelfGrid from "./ShelfGrid";
import { ShelfGridSkeleton } from "./ShelfSkeleton";
import { Loader2 } from "lucide-react";

export default function FilteredShelfList() {
	const tag = useAppSelector((state) => state.perpetua.tagFilter);
	const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useShelvesByTag(tag);
	const { data: count } = useTagShelfCount(tag);
	const sentinelRef = useRef<HTMLDivElement>(null);

	const shelves = useMemo(
		() => data?.pages.flatMap((p) => p.shelves) ?? [],
		[data?.pages],
	);

	const handleIntersect = useCallback(() => {
		if (hasNextPage && !isFetchingNextPage) fetchNextPage();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	useEffect(() => {
		if (!sentinelRef.current) return;
		const observer = new IntersectionObserver(
			([entry]) => { if (entry.isIntersecting) handleIntersect(); },
			{ rootMargin: "300px" },
		);
		observer.observe(sentinelRef.current);
		return () => observer.disconnect();
	}, [handleIntersect]);

	if (!tag) return null;
	if (isLoading) return <ShelfGridSkeleton />;

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-gray-400">
				<Badge variant="outline" className="text-sm py-1 px-3">{tag}</Badge>
				<span>{count !== undefined ? `${count} shelves` : "Loading..."}</span>
			</div>
			<ShelfGrid shelves={shelves} />
			{isFetchingNextPage && (
				<div className="flex justify-center py-6">
					<Loader2 className="h-5 w-5 animate-spin text-muted-foreground dark:text-gray-400" />
				</div>
			)}
			<div ref={sentinelRef} />
		</div>
	);
}
