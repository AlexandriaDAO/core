import React from "react";
import { Alert } from "@/components/Alert";
import MarketLogs from "@/features/imporium/components/MarketLogs";
import getMarketLogs from "@/features/imporium/thunks/getMarketLogs";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Skeleton } from "@/lib/components/skeleton";
import { Button } from "@/lib/components/button";
import { RefreshCcw } from "lucide-react";

const MarketLogsPage = () => {
    const dispatch = useAppDispatch();

    const { logs, loading, error } = useAppSelector((state) => state.imporium);

    if(loading) return <Skeleton className="w-full flex-grow rounded" />

    if(error) return (
        <div className="max-w-2xl flex-grow container flex justify-center items-start mt-20">
            <Alert variant="danger" title="Error" className="w-full">{error}</Alert>
        </div>
    )

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-1 items-center">
                <p className="text-sm text-muted-foreground">Here you will see Market Logs</p>
                <Button
                    variant="muted"
                    className="font-roboto-condensed text-sm text-primary/70 hover:text-primary cursor-pointer flex items-center justify-start gap-1"
                    onClick={()=>dispatch(getMarketLogs({}))}
                    disabled={loading}
                >
                    <span>Refresh List</span>
                    <RefreshCcw strokeWidth={2} size={16} className={`${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>
            <div className="lg:mb-20 md:mb-16 sm:mb-10 xs:mb-6">
                {logs && Array.isArray(logs) && logs.length <= 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">There are no logs yet.</p>
                    </div>
                ) : <MarketLogs />}
            </div>
        </div>
    );
};
export default MarketLogsPage;