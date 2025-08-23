import { useQuery } from '@tanstack/react-query';

const useInit = (id: string) => {
	const { data, error, isLoading } = useQuery({
		enabled: !!id,
		queryKey: ['asset-type', id],
		queryFn: async ({ signal }) => {
			if(id.length !== 43) throw new Error("Invalid transaction ID");

			const headResponse = await fetch('https://arweave.net/' + id, { method: 'HEAD', signal });

			if(!headResponse.ok) throw new Error(`Asset with id: '${id}' could not be found.`);

			// const contentLength = headResponse.headers.get('Content-Length');
			// const sizeInBytes = contentLength ? parseInt(contentLength, 10) : null;
			// console.log("Content-Length:", contentLength, "Size in bytes:", sizeInBytes);

			const contentType = headResponse.headers.get('Content-Type');
			if (!contentType) throw new Error("Unable to determine content type");

			const cleanMimeType = contentType.split(';')[0].trim();
			if (!cleanMimeType) throw new Error("Unable to determine MIME type");

			return cleanMimeType;
		},
		retry: 1,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 1000 * 60 * 60, // 1 hour
	});

	return {
		initializing: isLoading,
		initError: error,
		type: data,
	};
};

export default useInit;
