import { useEffect, useCallback, useRef } from "react";

interface UseInfiniteScrollOptions {
	hasNextPage: boolean;
	isLoading: boolean;
	loadMore: () => void;
	threshold?: number;
	rootMargin?: string;
}

export function useInfiniteScroll({
	hasNextPage,
	isLoading,
	loadMore,
	threshold = 0.1,
	rootMargin = "100px",
}: UseInfiniteScrollOptions) {
	const observerRef = useRef<IntersectionObserver | null>(null);
	const loadingRef = useRef<HTMLDivElement | null>(null);

	const handleIntersection = useCallback(
		(entries: IntersectionObserverEntry[]) => {
			const [entry] = entries;
			if (entry.isIntersecting && hasNextPage && !isLoading) {
				loadMore();
			}
		},
		[hasNextPage, isLoading, loadMore]
	);

	useEffect(() => {
		const element = loadingRef.current;
		if (!element) return;

		if (observerRef.current) {
			observerRef.current.disconnect();
		}

		observerRef.current = new IntersectionObserver(handleIntersection, {
			threshold,
			rootMargin,
		});

		observerRef.current.observe(element);

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, [handleIntersection, threshold, rootMargin]);

	return { loadingRef };
}
