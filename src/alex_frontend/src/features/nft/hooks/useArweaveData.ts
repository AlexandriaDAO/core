import { useState, useEffect } from "react";
import arweaveClient from "@/utils/arweaveClient";
import { TransactionStatusResponse } from "arweave/node/transactions";
import { getFileTypeInfo, getFileTypeName } from "@/features/upload/constants";

const useArweaveData = (id: string) => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [status, setStatus] = useState<TransactionStatusResponse | null>(null);
	const [tags, setTags] = useState<{name: string, value: string}[] | null>(null);
	const [size, setSize] = useState<number | null>(null);
	const [contentType, setContentType] = useState<string | null>(null);
	const [assetType, setAssetType] = useState<string | undefined>(undefined);

	// contentType

	// assetType

	// block height
	// confirmations
	// size
	// timestamp


	// https://arweave.net/tx/${id}/tags
	// tags


	useEffect(() => {
		const fetchStatus = async () => {
			try {
				setLoading(true);
				const status: TransactionStatusResponse = await arweaveClient.transactions.getStatus(id);
				setStatus(status);

				if (!status.confirmed) {
					throw new Error("Transaction is not yet confirmed");
				}
			} catch (err) {
				console.error("Error fetching Transaction Status:", err);
				setError( err instanceof Error ? err.message : "Failed to load Transaction Status");
				setLoading(false);
			}
		};

		fetchStatus();
	}, [id]);


	useEffect(() => {
		if (loading || !status || !status.confirmed) return;

		const fetchTransaction = async () => {
			try {
				setLoading(true);
				const response = await fetch('https://arweave.net/tx/' + id);
				if(response.ok){
					const data = await response.json();

					const tags: {name: string, value: string}[] = data.tags.map((tag: {name: string, value: string}) => ({
						name: atob(tag.name),
						value: atob(tag.value)
					}));


					setSize(data.data_size);

					setTags(tags);
				}else{
					throw new Error("Failed to fetch Transaction data");
				}
			} catch (err) {
				console.error("Error fetching Transaction data:", err);
				setError( err instanceof Error ? err.message : "Failed to load Transaction data");
			} finally {
				setLoading(false);
			}
		};

		fetchTransaction();
	}, [status]);

	useEffect(() => {
		if (!tags || tags.length <= 0) return;
		setContentType(tags.find(tag => tag.name.toLowerCase() === "content-type")?.value || "application/octet-stream");
	}, [tags]);

	useEffect(() => {
		if (!contentType) return;
		const type = getFileTypeInfo(contentType)?.label;
		setAssetType(type);
	}, [contentType]);


	// useEffect(() => {
	// 	const fetchData = async () => {
	// 		try {
	// 			setLoading(true);

	// 			// Get transaction details using arweaveClient
	// 			const status: TransactionStatusResponse = await arweaveClient.transactions.getStatus(id);

	// 			// If transaction is not confirmed, throw an error
	// 			if (!status.confirmed) {
	// 				throw new Error("Transaction is not yet confirmed");
	// 			}

	// 			const confirmations = status.confirmed ? status.confirmed.number_of_confirmations: 0;
	// 			const block = status.confirmed.block_height;

	// 			// Fetch block info to get timestamp
	// 			try {
	// 				const blockData = await arweaveClient.blocks.getByHeight(block);

	// 				// Arweave timestamps are in seconds, convert to milliseconds for JavaScript Date
	// 				const timestamp = parseInt(String(blockData.timestamp)) * 1000;
	// 			} catch (blockError) {
	// 				console.error("Error fetching block data:", blockError);
	// 			}




	// 			// Fetch transaction data
	// 			const transaction: Transaction = await arweaveClient.transactions.get(
	// 				id
	// 			);


	// 			const size = parseInt(transaction.data_size);
	// 			const content = transaction.data;
	// 			const tags = transaction.tags.map((tag) => ({
	// 				name: tag.get("name", { decode: true, string: true }),
	// 				value: tag.get("value", { decode: true, string: true }),
	// 			}));
	// 			const contentType = tags.find(tag => tag.name.toLowerCase() === "content-type")?.value || "application/octet-stream";


				

	// 			setData({
	// 				data: transactionData.data,
	// 				tags,
	// 				contentType,
	// 				transactionDetails,
	// 			});
	// 			setError(null);
	// 		} catch (err) {
	// 			console.error("Error fetching NFT data:", err);
	// 			setError(
	// 				err instanceof Error
	// 					? err.message
	// 					: "Failed to load NFT data"
	// 			);
	// 		} finally {
	// 			setLoading(false);
	// 		}
	// 	};

	// 	fetchData();
	// }, [id]);


	// useEffect(() => {
	// 	const fetchData = async () => {
	// 		try {
	// 			setLoading(true);

	// 			// Get transaction details using arweaveClient
	// 			const status: TransactionStatusResponse = await arweaveClient.transactions.getStatus(id);

	// 			// If transaction is not confirmed, throw an error
	// 			if (!status.confirmed) {
	// 				throw new Error("Transaction is not yet confirmed");
	// 			}

	// 			const confirmations = status.confirmed ? status.confirmed.number_of_confirmations: 0;
	// 			const block = status.confirmed.block_height;

	// 			// Fetch block info to get timestamp
	// 			try {
	// 				const blockData = await arweaveClient.blocks.getByHeight(block);

	// 				// Arweave timestamps are in seconds, convert to milliseconds for JavaScript Date
	// 				const timestamp = parseInt(String(blockData.timestamp)) * 1000;
	// 			} catch (blockError) {
	// 				console.error("Error fetching block data:", blockError);
	// 			}




	// 			// Fetch transaction data
	// 			const transaction: Transaction = await arweaveClient.transactions.get(
	// 				id
	// 			);


	// 			const size = parseInt(transaction.data_size);
	// 			const content = transaction.data;
	// 			const tags = transaction.tags.map((tag) => ({
	// 				name: tag.get("name", { decode: true, string: true }),
	// 				value: tag.get("value", { decode: true, string: true }),
	// 			}));
	// 			const contentType = tags.find(tag => tag.name.toLowerCase() === "content-type")?.value || "application/octet-stream";


				

	// 			setData({
	// 				data: transactionData.data,
	// 				tags,
	// 				contentType,
	// 				transactionDetails,
	// 			});
	// 			setError(null);
	// 		} catch (err) {
	// 			console.error("Error fetching NFT data:", err);
	// 			setError(
	// 				err instanceof Error
	// 					? err.message
	// 					: "Failed to load NFT data"
	// 			);
	// 		} finally {
	// 			setLoading(false);
	// 		}
	// 	};

	// 	fetchData();
	// }, [id]);

	return { status, tags, size, contentType, assetType, loading, error };
};

export default useArweaveData;
