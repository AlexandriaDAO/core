// Simple pagination calculations
export const calculatePagination = (totalCount: bigint, pageSize: number) => {
	const totalItems = Number(totalCount);
	const totalPages = Math.ceil(totalItems / pageSize);

	return {
		totalItems,
		totalPages,
	};
};

// Calculate the start position for pagination
export const calculateStartPosition = (
	page: number,
	pageSize: number,
	totalCount: bigint,
	sortOrder: "newest" | "oldest"
): number => {
	const totalItems = Number(totalCount);

	if (sortOrder === "newest") {
		// For newest first, we start from the end and work backwards
		const start = Math.max(0, totalItems - (page + 1) * pageSize);
		return start;
	} else {
		// For oldest first, we start from the beginning
		return page * pageSize;
	}
};

// Calculate how many items to take for this page
export const calculateTakeAmount = (
	startPosition: number,
	pageSize: number,
	totalCount: bigint
): number => {
	const totalItems = Number(totalCount);
	return Math.min(pageSize, totalItems - startPosition);
};
