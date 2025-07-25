import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNsfwContext } from "@/providers/NsfwProvider";
import { NsfwAnalysisResult } from '../types/assetTypes';
import { wait } from '@/utils/lazyLoad';

// NSFW analysis with tanstack query caching - massive performance improvement!
const useNsfwAnalysis = (
	assetUrl: string, 
	contentType: string, 
	enabled: boolean = true
): NsfwAnalysisResult => {
	const { modelLoaded, analyze } = useNsfwContext();

	// Create a stable cache key that won't change unnecessarily
	const cacheKey = useMemo(() => {
		if (!enabled || !modelLoaded || !assetUrl) {
			return null;
		}
		return ['nsfw-analysis', assetUrl, contentType];
	}, [enabled, modelLoaded, assetUrl, contentType]);

	// TSQ fetcher function that performs the actual NSFW analysis
	const analyzeAsset = async ([, url, type]: [string, string, string]): Promise<boolean> => {
		try {
			// Create a temporary element for analysis based on content type
			if (type.startsWith('image/')) {
				return await analyzeImage(url, analyze);
			} else if (type.startsWith('video/')) {
				return await analyzeVideo(url, analyze);
			}

			// Default to safe for unsupported types
			return false;
		} catch (error) {
			console.warn('NSFW analysis failed:', error);
			// Fail safe - assume content is safe if analysis fails
			return false;
		}
	};

	const { data: isNsfw, error, isLoading } = useQuery({
		queryKey: cacheKey || ['nsfw-disabled'],
		queryFn: () => cacheKey ? analyzeAsset(cacheKey as [string, string, string]) : Promise.resolve(false),
		enabled: !!cacheKey,
		// Cache settings - this is where the magic happens!
		refetchOnWindowFocus: false,        // Don't re-analyze when user focuses tab
		refetchOnReconnect: false,          // Don't re-analyze on network reconnect
		staleTime: 1000 * 60 * 60 * 24,     // Cache for 24 hours
		retry: 1,                          // Only retry once on failure
		retryDelay: 5000,                  // Wait 5s before retrying

		// Keep previous data during revalidation (smooth UX)
		placeholderData: (previousData: boolean | undefined) => previousData
	});

	return {
		isNsfw: isNsfw || false,
		analyzing: isLoading,
		error: error?.message,
	};
};

// Helper function to analyze images
const analyzeImage = async (
	url: string,
	analyze: (element: HTMLImageElement | HTMLVideoElement, contentType: string) => Promise<boolean>
): Promise<boolean> => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = 'anonymous';

		img.onload = async () => {
			try {
				const result = await analyze(img, 'image/jpeg');
				resolve(result);
			} catch (error) {
				reject(error);
			}
		};

		img.onerror = () => {
			reject(new Error('Failed to load image for NSFW analysis'));
		};

		img.src = url;
	});
};

// Helper function to analyze videos
const analyzeVideo = async (
	url: string,
	analyze: (element: HTMLImageElement | HTMLVideoElement, contentType: string) => Promise<boolean>
): Promise<boolean> => {
	return new Promise((resolve, reject) => {
		const video = document.createElement('video');
		video.crossOrigin = 'anonymous';
		video.muted = true;
		video.playsInline = true;

		video.onloadeddata = async () => {
			try {
				// Seek to 1 second for analysis (same as VideoCard does for thumbnail)
				video.currentTime = Math.min(1, video.duration * 0.1);

				video.onseeked = async () => {
					try {
						const result = await analyze(video, 'video/mp4');
						resolve(result);
					} catch (error) {
						reject(error);
					}
				};
			} catch (error) {
				reject(error);
			}
		};

		video.onerror = () => {
			reject(new Error('Failed to load video for NSFW analysis'));
		};

		video.src = url;
	});
};

export default useNsfwAnalysis;