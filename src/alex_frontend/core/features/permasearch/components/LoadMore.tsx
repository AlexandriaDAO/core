import React from "react";
import { Button } from "@/lib/components/button";
import { LoaderPinwheel, Search } from "lucide-react";

interface LoadMoreProps {
	hasNext: boolean;
	loading: boolean;
	isEmpty: boolean;
	onLoadMore: () => void;
	resultCount?: number;
}

const LoadMore: React.FC<LoadMoreProps> = ({ hasNext, loading, isEmpty, onLoadMore, resultCount = 0 }) => {
	if (isEmpty) {
		return (
			<div className="flex flex-col items-center justify-center py-16 space-y-4">
				<div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
					<Search className="h-8 w-8 text-gray-400 dark:text-gray-500" />
				</div>
				<div className="text-center space-y-1">
					<p className="text-lg font-medium text-gray-900 dark:text-gray-100">
						No transactions found
					</p>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Try adjusting your filters or search query
					</p>
				</div>
			</div>
		);
	}

	if (!hasNext) {
		return (
			<div className="flex flex-col items-center justify-center py-12 space-y-3">
				<div className="text-center space-y-1">
					<p className="text-base font-medium text-gray-900 dark:text-gray-100">
						That's all for now!
					</p>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						{resultCount > 0
							? `Showing all ${resultCount} result${resultCount === 1 ? "" : "s"}`
							: "No more results to load"}
					</p>
				</div>
			</div>
		);
	}

	if (resultCount > 0) {
		return (
			<div className="flex justify-center mt-6 mb-8">
				<Button
					onClick={onLoadMore}
					disabled={loading}
					className="bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-[#454545] transition-colors flex items-center"
				>
					{loading ? <>
						<LoaderPinwheel className="animate-spin mr-2 h-4 w-4" />
						Loading more...
					</>:'Show More'}
				</Button>
			</div>
		);
	}

	return null;
}

export default LoadMore;