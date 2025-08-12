import React, {Fragment} from "react";
import { Transaction } from "../types/index";
import { Masonry } from "react-plock";

interface ResultsGridProps {
	loading: boolean;
	transactions: Transaction[];
	children: (transaction: Transaction) => React.ReactNode;
}

const ResultsGrid: React.FC<ResultsGridProps> = ({ loading, transactions, children }) => {
	if (transactions.length === 0) {
		if(loading) return (
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
				{[...Array(12)].map((_, i) => (
					<div
						key={i}
						className="h-80 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
					/>
				))}
			</div>
		);

		return (
			<div className="flex-grow flex flex-col items-center justify-center py-12 space-y-3">
				<p className="text-base font-medium text-gray-900 dark:text-gray-100">
					No results to show.
				</p>
			</div>
		)
	}

	// return (
	// 	<Masonry
	// 		items={transactions}
	// 		config={{
	// 			columns: [1, 2, 3],
	// 			gap: [16, 16, 16],
	// 			media: [640, 768, 1024],
	// 		}}
	// 		render={(tx) => children(tx)}
	// 	/>
	// )

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 items-center justify-items-center">
			{transactions.map((tx) => (
				<Fragment key={tx.id}>
					{children(tx)}
				</Fragment>
			))}
		</div>
	);

	
	// return (
	// 	<div className="flex flex-wrap items-center justify-center gap-4">
	// 		{transactions.map((tx) => (
	// 			<Fragment key={tx.id}>
	// 				{children(tx)}
	// 			</Fragment>
	// 		))}
	// 	</div>
	// );

	// return (
	// 	<div className="grid grid-cols-[repeat(auto-fit,minmax(24rem,1fr))] gap-4 justify-items-center place-items-center">
	// 		{transactions.map((tx) => (
	// 			<Fragment key={tx.id}>
	// 				{children(tx)}
	// 			</Fragment>
	// 		))}
	// 	</div>
	// );
}

export default ResultsGrid;