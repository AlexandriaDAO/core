import React, { useCallback, useEffect } from "react";
import { Alert } from "@/components/Alert";
import UserLogs from "@/features/imporium/components/UserLogs";
import useEmporium from "@/hooks/actors/useEmporium";
import getUserLogs from "@/features/imporium/thunks/getUserLog";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { reset } from "@/features/imporium/imporiumSlice";
import { Skeleton } from "@/lib/components/skeleton";
import { Button } from "@/lib/components/button";
import { RefreshCcw } from "lucide-react";


const MyLogsPage = () => {
    const dispatch = useAppDispatch();
    const {actor} = useEmporium();

    const { logs, loading, error } = useAppSelector((state) => state.imporium);

    const refresh = useCallback(() => {
        if(!actor) return;
        dispatch(getUserLogs({actor}));
    }, [actor]);

    useEffect(() => {
        if(actor) refresh();

        return ()=>{
            dispatch(reset())
        }
    }, [actor, refresh]);

    if(loading) return <Skeleton className="w-full flex-grow rounded" />

    if(error) return (
        <div className="max-w-2xl flex-grow container flex justify-center items-start mt-20">
            <Alert variant="danger" title="Error" className="w-full">{error}</Alert>
        </div>
    )

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-1 items-center">
                <p className="text-sm text-muted-foreground">Here you will find All your Logs</p>
                <Button
                    variant="muted"
                    className="font-roboto-condensed text-sm text-primary/70 hover:text-primary cursor-pointer flex items-center justify-start gap-1"
                    onClick={refresh}
                    disabled={loading}
                >
                    <span>Refresh List</span>
                    <RefreshCcw strokeWidth={2} size={16} className={`${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>
            <div className="p-2">
                <div className="lg:mb-20 md:mb-16 sm:mb-10 xs:mb-6">
                    {logs && Array.isArray(logs) && logs.length <= 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground text-lg">You don't have any logs yet.</p>
                        </div>
                    ) : <UserLogs />}
                </div>
            </div>
        </div>
    );
};
export default MyLogsPage;