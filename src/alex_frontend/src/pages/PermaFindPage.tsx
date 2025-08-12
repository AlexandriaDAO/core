import React from "react";
import { LoaderPinwheel } from "lucide-react";
import { Alert } from "@/components/Alert";
import Nft from "@/features/nft";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import {
    FilterBar,
    AdvanceFilters,
    ResultsGrid,
    MintButton,
    LoadMoreButton,
    useSearch,
    useUpdate,
    RandomDateSelector,
    setSafeSearch,
} from "@/features/permasearch";
import TopupBalanceWarning from "@/components/TopupBalanceWarning";
import { UnauthenticatedWarning } from "@/components/UnauthenticatedWarning";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { AddToShelfButton } from "@/components/AddToShelfButton";
import SafeSearchToggle from "@/components/SafeSearchToggle";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";

function PermaFindPage() {
    const dispatch = useAppDispatch();

    const { user } = useAppSelector(state => state.auth);

    const { showFilters, safeSearch, continuousScroll } = useAppSelector(state => state.permasearch);

    const { transactions, isLoading, isLoadingMore, isRefreshing, error, hasNextPage, isEmpty, loadMore, refresh} = useSearch();

    const update = useUpdate();

    const { loadingRef } = useInfiniteScroll({
        hasNextPage,
        isLoading: isLoading || isLoadingMore,
        loadMore,
        threshold: 0.1,
        rootMargin: '200px',
    });

    return (
        <div className="py-10 px-4 sm:px-6 md:px-10 flex-grow flex justify-center">
            <div className="max-w-7xl w-full flex flex-col gap-8">
                <div className="flex flex-col justify-center items-center gap-6 text-center">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            PermaFind
                        </h1>
                        <div className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto">
							<p> Discover and mint NFTs from Arweave's permanent storage network. </p>
							<p> Each mint costs 5 LBRY tokens. </p>
						</div>
                    </div>
                </div>

                <UnauthenticatedWarning />

                <TopupBalanceWarning />

                <div className="space-y-3 p-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg border">
                    <FilterBar isLoading={isLoading} isRefreshing={isRefreshing} isLoadingMore={isLoadingMore} transactionsCount={transactions.length} onRefresh={refresh}/>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <RandomDateSelector isRefreshing={isRefreshing} />
                        <SafeSearchToggle enabled={safeSearch} setEnabled={() => dispatch(setSafeSearch(!safeSearch))}/>
                    </div>
                </div>

                {showFilters && <AdvanceFilters />}

                {error && <Alert variant="danger" title="Error">{error.message}</Alert>}

                <ResultsGrid transactions={transactions} loading={isLoading}>
                    {(tx) => (
                        <Nft
                            key={tx.id}
                            id={tx.id}
                            checkNsfw={safeSearch}
                            action={
                                user && <>
                                    <AddToShelfButton item={{ arweaveId: tx.id }} variant="outline" scale="sm" onSuccess={()=>update(tx.id)}/>
                                    <MintButton transaction={tx} />
                                </>
                            }
                        />
                    )}
                </ResultsGrid>

                {/* Conditional rendering based on continuousScroll setting */}
                {continuousScroll ? (
                    <>
                        {/* Infinite scroll trigger element */}
                        {hasNextPage && (
                            <div 
                                ref={loadingRef}
                                className="flex justify-center py-8"
                            >
                                {isLoadingMore && (
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <LoaderPinwheel className="h-4 w-4 animate-spin" />
                                        Loading results...
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Fallback for when there are no more results */}
                        {!hasNextPage && !isEmpty && (
                            <div className="flex flex-col items-center justify-center py-12 space-y-3">
                                <div className="text-center space-y-1">
                                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                                        That's all for now!
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {transactions.length > 0
                                            ? `Showing all ${transactions.length} result${transactions.length === 1 ? "" : "s"}`
                                            : "No more results to load"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    /* Load More Button */
                    <LoadMoreButton
                        hasNext={hasNextPage}
                        loading={isLoadingMore}
                        onLoadMore={loadMore}
                        isEmpty={isEmpty}
                        resultCount={transactions.length}
                    />
                )}
            </div>
        </div>
    );
}

export default PermaFindPage;