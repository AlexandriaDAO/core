import React, { useCallback } from "react";
import { Alert } from "@/components/Alert";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import TopupBalanceWarning from "@/components/TopupBalanceWarning";
import { UnauthenticatedWarning } from "@/components/UnauthenticatedWarning";

// Redux actions for UI state
import { setPage } from "@/features/alexandrian/alexandrianSlice";

// TanStack Query hook for token data
import useTokens from "@/features/alexandrian/hooks/useTokens";

// Components
import { FilterBar, TokensGrid, PaginationControls } from "@/features/alexandrian/components";

function AlexisPage() {
	const dispatch = useAppDispatch();
	const {tokens, totalPages, totalItems, loading, updating, error, refresh } = useTokens();

	// Handlers for TanStack Query actions
	const handleRefresh = useCallback(() => {
		refresh();
	}, [refresh]);

	const handlePageClick = useCallback(
		(event: { selected: number }) => {
			dispatch(setPage(event.selected));
		},
		[dispatch]
	);


	const disabled = loading || updating;

	return (
        <div className="py-10 px-4 sm:px-6 md:px-10 flex-grow flex justify-center relative">
            <div className="max-w-7xl w-full flex flex-col gap-8">
                <div className="flex flex-col justify-center items-center gap-6 text-center">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            Alexandrian
                        </h1>
						<div className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto">
							<p> Browse and discover NFTs and SBTs from the Alexandrian library. </p>
							<p> Likes cost 10 LBRY {"("}5 burned | 5 to the creator{")"}.</p>
						</div>
                    </div>
                </div>

				<UnauthenticatedWarning />

				<TopupBalanceWarning />

                <div className="space-y-3 p-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg border">
					<FilterBar disabled={disabled} onRefresh={handleRefresh} />
					<PaginationControls totalPages={totalPages} totalItems={totalItems} disabled={disabled} onPageClick={handlePageClick} />
				</div>

				{error && <Alert variant="danger" title="Error">{error}</Alert>}

				<TokensGrid tokens={tokens} loading={loading} />
			</div>
		</div>
	);
}

export default AlexisPage;
