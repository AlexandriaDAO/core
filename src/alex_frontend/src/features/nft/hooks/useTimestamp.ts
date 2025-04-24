import { useState, useEffect } from "react";
import { TransactionStatusType } from "../types";

const useTimestamp = (status: TransactionStatusType) => {
	const [timestamp, setTimestamp] = useState<number>(0);
	const [readableTimestamp, setReadableTimestamp] = useState<string>("Unknown");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!status || typeof status !== 'object' || !status.block_height) return;

		const fetchTimestamp = async () => {
			try {
				setLoading(true);
				const response = await fetch('https://arweave.net/block/height/' + status.block_height);
				if(!response.ok){
					throw new Error("Failed to fetch Block timestamp");
				}
				const data = await response.json();

				setTimestamp(data.timestamp);

				// Format timestamp
				// const formatDate = (timestamp: number | null = null) => {
				// 	if (!timestamp) return "Unknown";
				// 	return new Date(timestamp).toLocaleDateString(undefined, {
				// 		year: "numeric",
				// 		month: "short",
				// 		day: "numeric",
				// 	});
				// };

				setReadableTimestamp(new Date(data.timestamp * 1000).toLocaleString(undefined, {
					year: "numeric",
					month: "short",
					day: "numeric",
				}));
			} catch (err) {
				console.error("Error fetching Block timestamp:", err);
				setError( err instanceof Error ? err.message : "Failed to load Block timestamp");
			} finally {
				setLoading(false);
			}
		};

		fetchTimestamp();
	}, [status]);

	return { timestamp, readableTimestamp, loading, error };
};

export default useTimestamp;
