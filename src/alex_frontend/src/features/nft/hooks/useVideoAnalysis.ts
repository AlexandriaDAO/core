import { useQuery } from '@tanstack/react-query';
import { useNsfwContext } from "@/providers/NsfwProvider";

interface VideoAnalysisResult {
	nsfw: boolean;
	analyzing: boolean;
}

// Content safety analysis using browser cache - no duplicate network requests!
const useVideoAnalysis = (
	url: string,
	enabled: boolean
): VideoAnalysisResult => {
	const { modelLoaded, analyze } = useNsfwContext();

	const { data: nsfw, isLoading: analyzing } = useQuery({
		queryKey: ['video-analysis', url],
		queryFn: async () => {
			// Create video element - will use browser cache for efficient loading
			const video = document.createElement('video');
			video.crossOrigin = 'anonymous'; // Required for NSFW analysis canvas access
			video.muted = true;
			video.playsInline = true;
			video.preload = 'metadata'; // Same as VideoCard for consistency

			return new Promise<boolean>((resolve, reject) => {
				video.onloadedmetadata = () => {
					// Set to same time as VideoCard for consistency (1 second or 10% of duration)
					video.currentTime = Math.min(1, video.duration * 0.1);
				};

				video.onseeked = async () => {
					try {
						// Analyze the frame at the seeked position
						const result = await analyze(video, 'video/mp4');
						resolve(result);
					} catch (error) {
						reject(error);
					}
				};

				video.onerror = () => {
					reject(new Error('Failed to load video for analysis'));
				};

				// Set source last to trigger loading - should load from browser cache
				video.src = url;
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

export default useVideoAnalysis;