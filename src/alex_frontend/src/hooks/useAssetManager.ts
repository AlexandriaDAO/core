import { useMemo } from "react";
import { HttpAgent, Identity } from "@dfinity/agent";
import { AssetManager } from "@dfinity/assets";

interface UseAssetManagerOptions {
	canisterId?: string;
	identity?: Identity;
	maxSingleFileSize?: number;
	maxChunkSize?: number;
}

export function useAssetManager({
	canisterId,
	identity,
	maxSingleFileSize = 1_900_000, // Default value
	maxChunkSize = 500_000, // Default value
}: UseAssetManagerOptions) {
	const assetManager = useMemo(() => {
		if (!canisterId || !identity) return null;

		try {
			// Create agent
			const isLocal = !window.location.host.endsWith("ic0.app");
			const agent = HttpAgent.createSync({
				host: isLocal
					? `http://localhost:${window.location.port}`
					: "https://ic0.app",
				identity,
			});

			if (isLocal) {
				agent.fetchRootKey();
			}

			// Create asset manager
			return new AssetManager({
				canisterId,
				agent,
				maxSingleFileSize,
				maxChunkSize,
			});
		} catch (error) {
			console.error("Failed to create asset manager:", error);
			return null;
		}
	}, [canisterId, identity, maxSingleFileSize, maxChunkSize]);

	return assetManager;
}
