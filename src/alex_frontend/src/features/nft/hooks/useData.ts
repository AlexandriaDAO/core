import { useState, useEffect, useRef } from "react";

const isLocal = process.env.DFX_NETWORK == "local";

const useData = (id: string, canister?: string) => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<Uint8Array | null>(null);
	const [inCanister, setInCanister] = useState<boolean>(false);
	const [type, setType] = useState<string | null>(null);
	// const [progress, setProgress] = useState(0);
	const progress = useRef(0);


	// fetch data using arweaveClient
	// useEffect(() => {
	// 	if (!id) return;

	// 	const fetchData = async () => {
	// 		try {
	// 			setLoading(true);
	// 			// const response = await fetch('https://arweave.net/tx/' + id + '/data' );
	// 			// console.log('response', response);
	// 			// if(!response.ok){
	// 			// 	throw new Error("Failed to fetch Asset data");
	// 			// }

	// 			// const data = await response.arrayBuffer();

	// 			// const uint8Array = new Uint8Array(data);
	// 			// setData(uint8Array);

	// 			const data = await arweaveClient.transactions.getData(id, {
	// 				decode: true,
	// 			});

	// 			console.log('id', id, data);

	// 			setData(data as Uint8Array);


	// 			// const base64 = Arweave.utils.bufferTob64Url(uint8Array);
	// 			// console.log('id',id, data, uint8Array, base64);

	// 			// console.log('data response', response);
	// 			// const data = await response.arrayBuffer();
	// 			// console.log('data', data);
	// 			// const uint8Array = Arweave.utils.bufferTob64Url(data	);
	// 			// setData(uint8Array);
	// 		} catch (err) {
	// 			console.error("Error fetching Asset data:", err);
	// 			setError( err instanceof Error ? err.message : "Failed to load Asset data");
	// 		} finally {
	// 			setLoading(false);
	// 		}
	// 	};

	// 	fetchData();
	// }, [id]);


	// direct fetch without progress
	// useEffect(() => {
	// 	if (!id) return;

	// 	const fetchData = async () => {
	// 		try {
	// 			setLoading(true);
	// 			const response = await fetch('https://arweave.net/' + id );

	// 			if(!response.ok){
	// 				throw new Error("Failed to fetch Asset data");
	// 			}

	// 			const data = await response.arrayBuffer();

	// 			const uint8Array = new Uint8Array(data);
	// 			setData(uint8Array);
	// 		} catch (err) {
	// 			console.error("Error fetching Asset data:", err);
	// 			setError( err instanceof Error ? err.message : "Failed to load Asset data");
	// 		} finally {
	// 			setLoading(false);
	// 		}
	// 	};

	// 	fetchData();
	// }, [id]);


	// fetch with progress
	useEffect(() => {
		if (!id) return;

		const fetchData = async () => {
			try {
				if(id.length !== 43) throw new Error("Invalid ID");

				setLoading(true);
				progress.current = 0;

				let response = null;

				try {
					if(!canister) throw new Error("No user canister found");

					const baseUrl = isLocal ? `http://${canister}.localhost:4943` : `https://${canister}.raw.icp0.io`;
					const assetUrl = `${baseUrl}/arweave/${id}`;

					response = await fetch(assetUrl);

					if(!response.ok){
						throw new Error("Asset not found in canister");
					}
					setInCanister(true);
				} catch (error) {
					console.warn("Failed to fetch Asset from canister", error);
					response = await fetch('https://arweave.net/' + id);
					if(!response.ok){
						throw new Error("Failed to fetch Asset data from arweave");
					}
				}

				// type is the same as the tag Content-Type is set while uploading the asset
				const contentType = response.headers.get('Content-Type');
				if(contentType){
					setType(contentType);
				}

				// Get the total size if available
				const contentLength = response.headers.get('Content-Length');
				const total = contentLength ? parseInt(contentLength, 10) : 0;

				// Get the response as a readable stream
				const reader = response.body?.getReader();
				if (!reader) throw new Error("Failed to get stream reader");

				// Create array to hold all chunks
				const chunks: Uint8Array[] = [];
				let receivedLength = 0;

				// Read the stream
				while (true) {
					const { done, value } = await reader.read();

					if (done) break;

					// Add chunk to our array
					chunks.push(value);
					receivedLength += value.length;

					// Update progress
					if (total > 0) {
						const progressPercent = Math.round((receivedLength / total) * 100);
						progress.current = progressPercent;
					}
				}

				// Concatenate all chunks into a single Uint8Array
				const allChunks = new Uint8Array(receivedLength);
				let position = 0;
				for (const chunk of chunks) {
					allChunks.set(chunk, position);
					position += chunk.length;
				}

				setData(allChunks);
				progress.current = 100;
			} catch (err) {
				console.error("Error fetching Asset data:", err);
				setError(err instanceof Error ? err.message : "Failed to load Asset data");
			} finally {
				setLoading(false);
			}
		};

		fetchData();

		return () => {
			progress.current = 0;
		};
	}, [id]);

	return { data, loading, error, progress: progress.current, inCanister, type };
};

export default useData;
