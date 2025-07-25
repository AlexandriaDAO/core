import { useQuery } from '@tanstack/react-query';

const isLocal = process.env.DFX_NETWORK == "local";

// Extract the fetching logic into a separate function
const fetchAssetMetadata = async (id: string, canister?: string, signal?: AbortSignal) => {
	if(id.length !== 43) {
		throw new Error("Invalid transaction ID");
	}

	let contentType: string | undefined = undefined;
	let fromCanister = false;
	let finalAssetUrl: string;

	// Try canister first
	try {
		if(!canister) throw new Error("No user canister found");

		const baseUrl = isLocal ? `http://${canister}.localhost:4943` : `https://${canister}.raw.icp0.io`;
		const canisterAssetUrl = `${baseUrl}/arweave/${id}`;

		const headResponse = await fetch(canisterAssetUrl, { method: 'HEAD', signal });
		if(headResponse.ok){
			contentType = headResponse.headers.get('Content-Type') ?? undefined;
			fromCanister = true;
			finalAssetUrl = canisterAssetUrl;
		} else {
			throw new Error("Asset not found in canister");
		}
	} catch (error) {
		// Try Arweave
		const arweaveAssetUrl = 'https://arweave.net/' + id;
		const headResponse = await fetch(arweaveAssetUrl, { method: 'HEAD', signal });
		if(headResponse.ok){
			contentType = headResponse.headers.get('Content-Type') ?? undefined;
			finalAssetUrl = arweaveAssetUrl;
		} else {
			throw new Error("Asset not found on Arweave");
		}
	}

	// Clean content type
	const cleanMimeType = contentType ? contentType.split(';')[0].trim() : undefined;

	return {
		inCanister: fromCanister,
		type: cleanMimeType,
		assetUrl: finalAssetUrl
	};
};

const useInit = (id: string, canister?: string) => {
	const { data, error, isLoading } = useQuery({
		queryKey: ['asset-metadata', id, canister],
		queryFn: ({ signal }) => fetchAssetMetadata(id, canister, signal),
		enabled: !!id,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: 1,
		staleTime: 1000 * 60 * 60, // 1 hour
	});

	return {
		initializing: isLoading,
		initError: error?.message,
		inCanister: data?.inCanister ?? false,
		type: data?.type,
		assetUrl: data?.assetUrl
	};
};

export default useInit;
