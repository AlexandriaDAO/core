import React, { useState, useCallback } from "react";
import { Alert } from "@/components/Alert";
import { Skeleton } from "@/lib/components/skeleton";
import { Button } from "@/lib/components/button";
import { RefreshCcw } from "lucide-react";
import { LogsTable, LogsPagination, useMarketLogs } from "@/features/logs";

const MarketLogsPage: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(10);

    const { data, isPending, isFetching, error, refetch } = useMarketLogs(currentPage, pageSize);

    const logs = data?.logs ?? [];
    const totalPages = data?.totalPages ?? 0;

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const handlePageClick = useCallback((event: { selected: number }) => {
        const newPage: number = event.selected + 1;
        setCurrentPage(newPage);
    }, []);

    // Show skeleton only on initial load (no data yet)
    if (isPending) return <Skeleton className="w-full flex-grow rounded" />

    if (error) return (
        <div className="max-w-2xl flex-grow container flex justify-center items-start mt-20">
            <Alert variant="danger" title="Error" className="w-full">
                {error instanceof Error ? error.message : 'An error occurred while fetching logs'}
            </Alert>
        </div>
    );

    return (
        <div className="sm:w-10/12 flex flex-col gap-4">
            <div className="flex gap-1 items-center">
                <p className="text-sm text-muted-foreground">Here you will see Market Logs</p>
                <Button
                    variant="muted"
                    className="font-roboto-condensed text-sm text-primary/70 hover:text-primary cursor-pointer flex items-center justify-start gap-1"
                    onClick={handleRefresh}
                    disabled={isFetching}
                >
                    <span>Refresh List</span>
                    <RefreshCcw strokeWidth={2} size={16} className={`${isFetching ? 'animate-spin' : ''}`} />
                </Button>
            </div>
            <div className="lg:mb-20 md:mb-16 sm:mb-10 xs:mb-6">
                <LogsTable logs={logs} emptyMessage="There are no logs yet."/>
                <LogsPagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={handlePageClick}
                    disabled={isFetching}
                />
            </div>
        </div>
    );
};

export default MarketLogsPage;