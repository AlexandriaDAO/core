import { useQuery } from '@tanstack/react-query';
import { Tags } from "../types";

interface TransactionMetadata {
	id: string;
	owner: string;
	status: 'confirmed' | 'pending' | 'not_found';
	tags: Tags;
	size: number;
	timestamp: number;
	blockHeight: number;
	bundledIn?: string;
}

// Extract the fetching logic into a separate function
const fetchTransactionMetadata = async (id: string, signal?: AbortSignal): Promise<TransactionMetadata> => {
	if (!id || id.length !== 43) throw new Error("Invalid transaction ID");

	// Use GraphQL to fetch all metadata in one call
	const query = `
		query GetTransactionDetails($id: ID!) {
			transaction(id: $id) {
				id
				owner {
					address
				}
				data {
					size
					type
				}
				tags {
					name
					value
				}
				block {
					height
					timestamp
				}
				bundledIn {
					id
				}
			}
		}
	`;

	const response = await fetch('https://arweave.net/graphql', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			query,
			variables: { id }
		}),
		signal
	});

	if (!response.ok) throw new Error('Failed to fetch transaction metadata');

	const result = await response.json();

	if (result.errors) throw new Error(result.errors[0].message);

	const txData = result.data.transaction;

	if (!txData) {
		// Transaction not found or pending
		return {
			id,
			owner: '',
			status: 'not_found',
			tags: [],
			size: 0,
			timestamp: 0,
			blockHeight: 0,
		} as TransactionMetadata;
	}

	return {
		id,
		owner: txData.owner?.address || '',
		status: txData.block ? 'confirmed' : 'pending',
		tags: txData.tags,
		size: parseInt(txData.data?.size || '0'),
		timestamp: txData.block?.timestamp || 0,
		blockHeight: txData.block?.height || 0,
		bundledIn: txData.bundledIn?.id
	} as TransactionMetadata;
};

const useTransactionMetadata = (id: string, enabled: boolean = true) => {
	const { data: metadata, error, isLoading } = useQuery({
		queryKey: ['transaction-metadata', id],
		queryFn: ({ signal }) => fetchTransactionMetadata(id, signal),
		enabled: enabled && !!id,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		retry: 2,
		retryDelay: 1000,
		staleTime: 1000 * 60 * 10, // 10 minutes cache for metadata
	});

	return {
		metadata: metadata || null,
		loading: isLoading,
		error: error?.message || null
	};
};

export default useTransactionMetadata;