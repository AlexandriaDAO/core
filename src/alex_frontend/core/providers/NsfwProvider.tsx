import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import { nsfwService } from "@/services/nsfwService";

interface NsfwContextType {
	modelLoaded: boolean;
	modelLoading: boolean;
	analyze: (
		element: HTMLImageElement | HTMLVideoElement,
		contentType: string
	) => Promise<boolean>;
}

const NsfwContext = createContext<NsfwContextType | undefined>(undefined);

export const useNsfwContext = () => {
	const context = useContext(NsfwContext);
	if (!context) throw new Error("useNsfwContext must be used within NsfwProvider");

	return context;
};

interface NsfwProviderProps {
	children: ReactNode;
}

export const NsfwProvider: React.FC<NsfwProviderProps> = ({ children }) => {
	const [modelLoaded, setModelLoaded] = useState(false);
	const [modelLoading, setModelLoading] = useState(false);

	// Load the NSFW model on app start
	useEffect(() => {
		const loadModel = async () => {
			try {
				setModelLoading(true);
				const success = await nsfwService.loadModel();
				setModelLoaded(success);
			} catch (error) {
				console.error("Failed to load NSFW model:", error);
				setModelLoaded(false);
			} finally {
				setModelLoading(false);
			}
		};

		loadModel();

		// Cleanup on unmount
		return () => {
			nsfwService.unloadModel();
		};
	}, []);

	// General analyze function for loaded image/video elements
	const analyze = async (
		element: HTMLImageElement | HTMLVideoElement,
		contentType: string
	): Promise<boolean> => {
		if (!modelLoaded) {
			console.warn("NSFW model not loaded yet");
			return false;
		}

		try {
			// Analyze with NSFW service
			const prediction = await nsfwService.validateContent(
				element,
				contentType
			);
			return prediction?.isPorn || false;
		} catch (error) {
			console.error("NSFW analysis failed:", error);
			return false; // Fail gracefully
		}
	};

	const value: NsfwContextType = {
		modelLoaded,
		modelLoading,
		analyze,
	};

	return <NsfwContext.Provider value={value}>{children}</NsfwContext.Provider>
};

export default NsfwProvider;
