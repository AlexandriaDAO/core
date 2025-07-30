import React, { useCallback, useEffect } from "react";
import { Alert } from "@/components/Alert";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import TopupBalanceWarning from "@/components/TopupBalanceWarning";
import { UnauthenticatedWarning } from "@/components/UnauthenticatedWarning";

// Redux actions for UI state
import { setPage } from "@/features/alexandrian/alexandrianSlice";

// Legacy imports for users (still using Redux thunk for now)
import fetchUsers from "@/features/alexandrian/thunks/fetchUsers";

// TanStack Query hook for token data
import useTokens from "@/features/alexandrian/hooks/useTokens";

// Components
import { FilterBar, TokensGrid, PaginationControls } from "@/features/alexandrian/components";

function AlexisPage() {
	const dispatch = useAppDispatch();
	const {tokens, totalPages, loading, updating, error, refresh } = useTokens();

	// Load users on mount (keeping Redux for now)
	useEffect(() => {
		dispatch(fetchUsers());
	}, []);

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

				<FilterBar disabled={disabled} onRefresh={handleRefresh} />

				{error && <Alert variant="danger" title="Error">{error}</Alert>}

				<TokensGrid tokens={tokens} loading={loading} />

				<PaginationControls totalPages={totalPages} disabled={disabled} onPageClick={handlePageClick} />
			</div>
		</div>
	);
}

export default AlexisPage;
