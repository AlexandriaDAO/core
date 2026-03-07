import React, { useMemo, useCallback, useEffect, useRef } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useRecentFeed, useRandomFeed, useStorylineFeed } from "../hooks/useFeeds";
import ShelfGrid from "./ShelfGrid";
import { ShelfGridSkeleton } from "./ShelfSkeleton";
import { Loader2, Inbox, Compass, Users, AlertCircle } from "lucide-react";

export default function FeedView() {
	const feedType = useAppSelector((state) => state.valora.feedType);

	if (feedType === "recency") return <RecencyFeed />;
	if (feedType === "random") return <RandomFeed />;
	return <StorylineFeed />;
}

function RecencyFeed() {
	const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage, error } = useRecentFeed();
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

	if (isLoading) return <ShelfGridSkeleton />;

	if (error) return <FeedError message="Failed to load recent shelves." />;

	if (shelves.length === 0) {
		return <FeedEmpty icon={<Inbox className="h-6 w-6" />} message="No shelves yet. Be the first to create one!" />;
	}

	return (
		<>
			<ShelfGrid shelves={shelves} />
			{isFetchingNextPage && <LoadingMore />}
			<div ref={sentinelRef} />
		</>
	);
}

function RandomFeed() {
	const { data, isLoading, error } = useRandomFeed();

	if (isLoading) return <ShelfGridSkeleton />;
	if (error) return <FeedError message="Failed to load shelves to discover." />;

	if (!data || data.length === 0) {
		return <FeedEmpty icon={<Compass className="h-6 w-6" />} message="No shelves to discover yet." />;
	}

	return <ShelfGrid shelves={data} />;
}

function StorylineFeed() {
	const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage, error } = useStorylineFeed();
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

	if (isLoading) return <ShelfGridSkeleton />;
	if (error) return <FeedError message="Failed to load your storyline." />;

	if (shelves.length === 0) {
		return <FeedEmpty icon={<Users className="h-6 w-6" />} message="Follow users or tags to see your storyline feed." />;
	}

	return (
		<>
			<ShelfGrid shelves={shelves} />
			{isFetchingNextPage && <LoadingMore />}
			<div ref={sentinelRef} />
		</>
	);
}

function LoadingMore() {
	return (
		<div className="flex justify-center py-6">
			<Loader2 className="h-5 w-5 animate-spin text-muted-foreground dark:text-gray-400" />
		</div>
	);
}

function FeedEmpty({ icon, message }: { icon: React.ReactNode; message: string }) {
	return (
		<div className="flex flex-col items-center gap-4 py-24 text-muted-foreground dark:text-gray-400 animate-fade">
			<div className="h-12 w-12 rounded-full bg-muted dark:bg-gray-800 flex items-center justify-center">
				{icon}
			</div>
			<p className="text-base">{message}</p>
		</div>
	);
}

function FeedError({ message }: { message: string }) {
	return (
		<div className="flex flex-col items-center gap-4 py-24 text-muted-foreground dark:text-gray-400 animate-fade">
			<div className="h-12 w-12 rounded-full bg-destructive/10 dark:bg-red-900/30 flex items-center justify-center">
				<AlertCircle className="h-6 w-6 text-destructive dark:text-red-400" />
			</div>
			<p className="text-base">{message}</p>
		</div>
	);
}
