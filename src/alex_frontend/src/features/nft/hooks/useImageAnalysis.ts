import { useQuery } from '@tanstack/react-query';
import { useNsfwContext } from "@/providers/NsfwProvider";

interface ImageAnalysisResult {
	nsfw: boolean;
	analyzing: boolean;
}

// Content safety analysis using browser cache - no duplicate network requests!
const useImageAnalysis = (
	url: string,
	enabled: boolean // checkNsfw && ready
): ImageAnalysisResult => {
	const { modelLoaded, analyze } = useNsfwContext();

	const { data: nsfw, isLoading: analyzing } = useQuery({
		queryKey: ['image-analysis', url],
		queryFn: async () => {
			// Create image object - will load from browser cache instantly
			const img = new Image();
			img.crossOrigin = 'anonymous'; // Required for NSFW analysis canvas access

			return new Promise<boolean>((resolve, reject) => {
				img.onload = async () => {
					try {
						const result = await analyze(img, 'image/jpeg');
						resolve(result);
					} catch (error) {
						reject(error);
					}
				};

				img.onerror = () => {
					reject(new Error('Failed to load image for analysis'));
				};

				img.src = url; // Should load instantly from browser cache
			});
		},
		enabled: enabled && !!url && modelLoaded,
		// Cache settings - avoid re-analyzing same content
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
		retry: 1,
		retryDelay: 5000,
		// Default to safe (blurred) for new URLs, keep previous data for cached ones
		placeholderData: (previousData) => previousData ?? false
	});

	return {
		nsfw: nsfw ?? false,
		analyzing,
	};
};

export default useImageAnalysis;