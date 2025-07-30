import React from "react";
import SafeSearchToggle from "@/components/SafeSearchToggle";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setSafe } from "@/features/marketplace/marketplaceSlice";

interface ResultsBarProps {
	totalCount: number;
}

const ResultsBar: React.FC<ResultsBarProps> = ({
	totalCount,
}) => {
	const dispatch = useAppDispatch();
	const { safe, selectedUser, searchTerm } = useAppSelector((state) => state.marketplace);
	const getResultsText = () => {
		if (searchTerm && selectedUser) {
			return `${totalCount} result${totalCount !== 1 ? 's' : ''} for "${searchTerm}" by ${selectedUser.toString().slice(0, 8)}...${selectedUser.toString().slice(-4)}`;
		} else if (searchTerm) {
			return `${totalCount} result${totalCount !== 1 ? 's' : ''} for "${searchTerm}"`;
		} else if (selectedUser) {
			return `${totalCount} listing${totalCount !== 1 ? 's' : ''} by ${selectedUser.toString().slice(0, 8)}...${selectedUser.toString().slice(-4)}`;
		} else {
			return `${totalCount} total listing${totalCount !== 1 ? 's' : ''}`;
		}
	};

	return (
		// flex flex-col md:flex-row justify-between items-center gap-4
		<div className="flex flex-col md:flex-row justify-between items-center gap-4">
			<div className="text-sm text-muted-foreground">
				{getResultsText()}
			</div>

			<div className="flex flex-wrap items-center gap-4">
				<SafeSearchToggle enabled={safe} setEnabled={() => dispatch(setSafe(!safe))} />
			</div>
		</div>
	);
};

export default ResultsBar;