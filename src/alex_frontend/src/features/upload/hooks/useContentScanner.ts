import { useEffect } from "react";
import { nsfwService } from "@/apps/Modules/shared/services/nsfwService";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setScanError, setScanning } from "../uploadSlice";

interface UseContentScannerProps {
	file: File | null;
}

export function useContentScanner({ file }: UseContentScannerProps) {
	const dispatch = useAppDispatch();

	useEffect(() => {
		let isMounted = true;

		const checkFileForNsfw = async () => {
			// Reset states
			dispatch(setScanError(null));

			// Skip if no file or if file is not an image/video
			if (!file) return;

			const fileType = file.type;
			if (
				!fileType.startsWith("image/") &&
				!fileType.startsWith("video/")
			) {
				return; // Skip NSFW check for non-image/video files
			}

			try {
				dispatch(setScanning(true));

				// Create object URL for the file
				const objectUrl = URL.createObjectURL(file);

				// Create appropriate element for the file type
				let element: HTMLImageElement | HTMLVideoElement;
				if (fileType.startsWith("image/")) {
					element = document.createElement("img");
					element.src = objectUrl;

					// Wait for image to load
					await new Promise((resolve, reject) => {
						element.onload = resolve;
						element.onerror = reject;
					});
				} else {
					element = document.createElement("video");
					element.src = objectUrl;
					element.muted = true;

					// Wait for video metadata to load
					await new Promise((resolve, reject) => {
						element.onloadedmetadata = () => {
							if (element instanceof HTMLVideoElement) {
								element.currentTime = 1; // Go to 1 second mark for preview frame
							}
							element.onloadeddata = resolve;
						};
						element.onerror = reject;
					});
				}

				// Use nsfwService to check the content
				const results = await nsfwService.validateContent(
					element,
					fileType
				);

				// Clean up URL
				URL.revokeObjectURL(objectUrl);

				// Check results
				if (results && isMounted) {
					console.log("NSFW Detection Results:", results);

					if (results.isPorn) {
						dispatch(setScanError(
							"Content appears to contain inappropriate material and can't be uploaded."
						));
					}
				}
			} catch (error) {
				console.error("Error checking for NSFW content:", error);
				if (isMounted) {
					dispatch(setScanError(
						"Failed to scan content for inappropriate material."
					));
				}
			} finally {
				if (isMounted) {
					dispatch(setScanning(false));
				}
			}
		};

		if (file) {
			checkFileForNsfw();
		}

		return () => {
			isMounted = false;
		};
	}, [file]);
}
