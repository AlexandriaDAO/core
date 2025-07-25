import React from "react";
import { Button } from "@/lib/components/button";
import { RefreshCw, Coins, LoaderPinwheel, Check, Database, Globe, Palette, Search } from "lucide-react";
import { Alert } from "@/components/Alert";
import Nft from "@/features/nft";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import {
    SearchFilters,
    AppliedFilters,
    SearchBox,
    SearchBanner,
    ResultsGrid,
    LoadMoreButton,
    useSearch,
    useMinting,
    FilterToggle,
    setSafeSearch,
    setContinuousScroll,
} from "@/features/permasearch";
import { TopupBalanceWarning } from "@/components/TopupBalanceWarning";
import { UnauthenticatedWarning } from "@/components/UnauthenticatedWarning";
import SafeSearchToggle from "@/components/SafeSearchToggle";
import ContinuousScrollToggle from "@/components/ContinuousScrollToggle";
import SortToggle from "@/features/permasearch/components/SortToggle";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

function PermaFindPage() {
    const dispatch = useAppDispatch();

    const { user } = useAppSelector(state => state.auth);
    const { query, appliedFilters, showFilters, sortOrder, safeSearch, continuousScroll } = useAppSelector(state => state.permasearch);

    const { transactions, isLoading, isLoadingMore, isLoadingMintStatus, isRefreshing, error, hasNextPage, isEmpty, loadMore, refresh, updateTransactionMinted } = useSearch({
        query, filters: appliedFilters, sortOrder,
    });

    const { mintTransaction, isMinting } = useMinting();

    const { loadingRef } = useInfiniteScroll({
        hasNextPage,
        isLoading: isLoadingMore,
        loadMore,
        threshold: 0.1,
        rootMargin: '200px',
    });

    const handleMint = async (transactionId: string) => {
        await mintTransaction(transactionId, () => {
            updateTransactionMinted(transactionId);
        });
    };

    return (
        <div className="py-10 px-4 sm:px-6 md:px-10 flex-grow flex justify-center relative">
            <div className="max-w-7xl w-full flex flex-col gap-8">
                <div className="flex flex-col justify-center items-center gap-6 text-center">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            PermaFind
                        </h1>
                        <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                            Discover and mint NFTs from Arweave's permanent storage network. Filter millions of decentralized assets by type, date, and tags.
                        </p>
                    </div>
                </div>

                <UnauthenticatedWarning />

                <TopupBalanceWarning />

                <div className="space-y-3 p-3 sticky top-2 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg border">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-4 w-full">
                        <div className="flex flex-wrap justify-start items-start gap-3">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-700 dark:text-green-300 rounded-full text-sm font-medium border border-green-500/30">
                                <Database className="w-4 h-4" />
                                Permanent Storage
                            </span>
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-500/30">
                                <Globe className="w-4 h-4" />
                                Decentralized Network
                            </span>
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium border border-purple-500/30">
                                <Palette className="w-4 h-4" />
                                NFT Minting
                            </span>
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium border border-orange-500/30">
                                <Search className="w-4 h-4" />
                                Advanced Search
                            </span>
                        </div>
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm font-medium border border-gray-400 dark:border-gray-600 whitespace-nowrap">
                            <Coins className="w-4 h-4" />
                            Each mint burns 5 LBRY tokens
                        </span>
                    </div>

                    <div className="flex flex-wrap items-stretch gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <FilterToggle isLoading={isLoading} />

                        <SortToggle
                            isLoading={isLoading}
                            count={transactions.length}
                        />

                        <SearchBox disabled={isLoading} />

                        <Button
                            onClick={refresh}
                            disabled={isLoading || isRefreshing || !!query}
                            variant="outline"
                            className="flex items-center gap-2 h-10"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading || isRefreshing ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {query ? (
                            <SearchBanner count={transactions.length} />
                        ) : (
                            <AppliedFilters />
                        )}
                        <div className="flex flex-wrap items-center gap-4">
                            <ContinuousScrollToggle
                                enabled={continuousScroll}
                                setEnabled={() => dispatch(setContinuousScroll(!continuousScroll))}
                            />
                            <SafeSearchToggle
                                enabled={safeSearch}
                                setEnabled={() => dispatch(setSafeSearch(!safeSearch))}
                            />
                        </div>
                    </div>
                </div>

                {showFilters && !query && <SearchFilters />}

                {error && (
                    <Alert variant="danger" title="Error">
                        {error.message}
                    </Alert>
                )}

                <ResultsGrid transactions={transactions} loading={isLoading}>
                    {(tx) => (
                        <Nft
                            key={tx.id}
                            id={tx.id}
                            checkNsfw={safeSearch}
                            action={
                                user && (
                                    <Button
                                        variant="outline"
                                        scale="sm"
                                        onClick={() => handleMint(tx.id)}
                                        disabled={isLoadingMintStatus || tx.minted || isMinting(tx.id)}
                                        className="flex items-center gap-1"
                                    >
                                        {isLoadingMintStatus ? (
                                            <>
                                                <LoaderPinwheel className="h-3 w-3 animate-spin" /> Checking...
                                            </>
                                        ): isMinting(tx.id) ? (
                                            <>
                                                <LoaderPinwheel className="h-3 w-3 animate-spin" /> Minting...
                                            </>
                                        ) : tx.minted ? (
                                            <>
                                                <Check className="h-3 w-3" /> Minted
                                            </>
                                        ) : (
                                            <>
                                                <Coins className="h-3 w-3" /> Mint
                                            </>
                                        )}
                                    </Button>
                                )
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
                                        Loading more results...
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