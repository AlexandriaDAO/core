import { useState, useEffect } from "react";
import { formatFileSize } from "@/features/upload/utils";
import { TransactionStatusType } from "../types";

const useSize = (id: string, status: TransactionStatusType) => {
	const [size, setSize] = useState<number>(0);
	const [readableSize, setReadableSize] = useState<string>("Unknown");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!id || status === null) return;

		const fetchSize = async () => {
			try {
				setLoading(true);
				const response = await fetch('https://arweave.net/tx/' + id + '/offset');
				if(!response.ok){
					throw new Error("Failed to fetch Transaction size");
				}
				const data = await response.json();

				setSize(data.size);
				setReadableSize(formatFileSize(data.size));
			} catch (err) {
				console.error("Error fetching Transaction size:", err);
				setError( err instanceof Error ? err.message : "Failed to load Transaction size");
			} finally {
				setLoading(false);
			}
		};

		fetchSize();
	}, [id, status]);


	return { size, readableSize, loading, error };
};

export default useSize;
