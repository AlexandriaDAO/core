import { useState, useEffect } from "react";
import { TransactionStatusType } from "../types";


const useStatus = (id: string) => {
	const [status, setStatus] = useState<TransactionStatusType>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchStatus = async () => {
			try {
				setLoading(true);
				const response = await fetch('https://arweave.net/tx/' + id + '/status');
				if(!response.ok){
					if(response.status === 404){
						throw new Error("Transaction not found.");
					}
					throw new Error("Failed to fetch Transaction status");
				}

				// Get the response text first
				const responseText = await response.text();

				// Try to parse as JSON
				try {
					const data = JSON.parse(responseText);
					setStatus(data);
				} catch (jsonError) {
					setStatus(responseText);
				}
			} catch (err) {
				setStatus(null);

				setError( err instanceof Error ? err.message : "Failed to load Transaction Status");
			} finally {
				setLoading(false);
			}
		};

		fetchStatus();
	}, [id]);

	return { status, loading, error };
};

export default useStatus;
