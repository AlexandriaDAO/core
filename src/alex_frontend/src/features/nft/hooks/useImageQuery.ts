import { useQuery } from "@tanstack/react-query";

// Helper function to preload an image and return a promise
const preloadImage = (url: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";

		img.onload = () => resolve(url);
		img.onerror = () => reject(new Error("Failed to load image"));

		img.src = url;
	});
};

export const useImageQuery = (url: string) => {
	return useQuery({
		queryKey: ["image", url],
		queryFn: () => preloadImage(url),
		staleTime: 1000 * 60 * 60 * 24, // 24 hours - images rarely change
		gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days - keep in cache for a week
		retry: 2,
		retryDelay: 1000,
		enabled: !!url, // Always enabled - React Query handles caching
	});
};
