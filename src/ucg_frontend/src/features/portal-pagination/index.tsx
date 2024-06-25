import React from "react";

interface PortalPaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	onSeeAll: () => void;
}

const PortalPagination: React.FC<PortalPaginationProps> = ({
	currentPage,
	totalPages,
	onPageChange,
	onSeeAll,
}) => {
	const generatePageNumbers = () => {
		const pageNumbers = [];

		// Add first three buttons
		for (let i = 1; i <= 3 && i <= totalPages; i++) {
			pageNumbers.push(i);
		}

		// Add dots if needed
		if (totalPages > 3 && currentPage > 3) {
			pageNumbers.push("...");
		}

		// Add the current page button
		if (currentPage > 3 && currentPage <= totalPages) {
			pageNumbers.push(currentPage);
		}

		return pageNumbers;
	};

	return (
		<div className="flex justify-center items-center gap-2 mt-4">
			{generatePageNumbers().map((page, index) => (
				<button
					key={index}
					onClick={() =>
						typeof page === "number" && onPageChange(page)
					}
					className={`px-3 py-1 border rounded ${
						currentPage === page
							? "bg-blue-500 text-white"
							: "bg-gray-200"
					}`}
				>
					{page}
				</button>
			))}
			{totalPages > 3 && currentPage <= totalPages && (
				<button
					onClick={() => onSeeAll()}
					className="px-3 py-1 border rounded bg-gray-200"
				>
					See All
				</button>
			)}
		</div>
	);
};

export default PortalPagination;
