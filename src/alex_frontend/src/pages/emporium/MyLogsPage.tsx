import React, { useEffect } from "react";
import NftsSkeleton from "@/layouts/skeletons/emporium/components/NftsSkeleton";
import { Alert } from "@/components/Alert";
import UserLogs from "@/features/imporium/components/UserLogs";
import useEmporium from "@/hooks/actors/useEmporium";
import getUserLogs from "@/features/imporium/thunks/getUserLog";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { reset } from "@/features/imporium/imporiumSlice";


const MyLogsPage = () => {
    const dispatch = useAppDispatch();
    const {actor} = useEmporium();

    const { logs, loading, error } = useAppSelector((state) => state.imporium);

    useEffect(() => {
        if(!actor) return;
        dispatch(getUserLogs({actor}));

        return ()=>{
            dispatch(reset())
        }
    }, [actor]);

    return (
        <>
            <div className="flex flex-col items-center gap-3 md:gap-6 mx-auto p-5 sm:p-10 w-full max-w-md md:max-w-2xl xl:max-w-[800px]">
                <h1 className="text-foreground text-center font-syne font-bold m-0 text-xl sm:text-2xl md:text-3xl lg:text-5xl">Emporium</h1>
                <div className="flex flex-col items-center gap-1 text-foreground text-center font-syne">
                    <h2 className="m-0 font-semibold text-base sm:text-lg md:text-xl lg:text-2xl">My Logs</h2>
                    <p className="m-0 font-normal text-sm sm:text-base md:text-lg lg:text-xl">Here you will find All your Logs</p>
                </div>
            </div>

            {loading ? (
                <NftsSkeleton />
            ) : error ? (
                <div className="max-w-2xl flex-grow container flex justify-center items-start mt-20">
                    <Alert variant="danger" title="Error" className="w-full">{error}</Alert>
                </div>
            ) : (
                <div className="p-2">
                    <div className="lg:mb-20 md:mb-16 sm:mb-10 xs:mb-6">
                        {logs && Array.isArray(logs) && logs.length <= 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground text-lg">You don't have any logs yet.</p>
                            </div>
                        ) : <UserLogs />}
                    </div>
                </div>
            )}
        </>
    );
};
export default MyLogsPage;