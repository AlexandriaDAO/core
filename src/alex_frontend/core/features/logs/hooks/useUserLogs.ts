import { useQuery } from "@tanstack/react-query";
import useEmporium from "@/hooks/actors/useEmporium";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { transformLogEntry } from "../utils";
import { TransformedLog } from "../types";
import type { Logs } from "../../../../../declarations/emporium/emporium.did";

interface UseUserLogsResult {
    logs: TransformedLog[];
    totalPages: number;
}

export const useUserLogs = (currentPage: number, pageSize: number) => {
    const { actor } = useEmporium();
    const { user } = useAppSelector(state => state.auth);

    return useQuery<Logs, Error, UseUserLogsResult>({
        queryKey: ['userLogs', currentPage, pageSize],
        queryFn: () => actor!.get_caller_logs([BigInt(currentPage)], [BigInt(pageSize)], []),
        enabled: !!actor && !!user,
        staleTime: 30000,
        placeholderData: (previousData) => previousData,
        select: (data: Logs): UseUserLogsResult => ({
            logs: data.logs.map(([timestamp, log]) => transformLogEntry(log, user!.principal)),
            totalPages: Number(data.total_pages),
        }),
    });
};