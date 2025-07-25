import React from "react";
import { Masonry } from "react-plock";
import { Transaction } from "../types/index";

interface ResultsGridProps {
	loading: boolean;
	transactions: Transaction[];
	children: (transaction: Transaction) => React.ReactNode;
}

const ResultsGrid: React.FC<ResultsGridProps> = ({ loading, transactions, children }) => {
	if (loading && transactions.length === 0) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{[...Array(9)].map((_, i) => (
					<div
						key={i}
						className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
					/>
				))}
			</div>
		);
	}

	return (
		<Masonry
			items={transactions}
			config={{
				columns: [1, 2, 3],
				gap: [16, 16, 16],
				media: [640, 768, 1024],
			}}
			render={(tx) => children(tx)}
		/>
	);
}

export default ResultsGrid;