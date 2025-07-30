import { useQuery } from "@tanstack/react-query";
import { transformLogEntry } from "../utils";
import { TransformedLog } from "../types";
import { emporium } from "../../../../../declarations/emporium";
import type { Logs } from "../../../../../declarations/emporium/emporium.did";

interface UseMarketLogsResult {
    logs: TransformedLog[];
    totalPages: number;
}

export const useMarketLogs = (currentPage: number, pageSize: number) => {
    return useQuery<Logs, Error, UseMarketLogsResult>({
        queryKey: ['marketLogs', currentPage, pageSize],
        queryFn: () => emporium!.get_logs([BigInt(currentPage)], [BigInt(pageSize)], []),
        enabled: !!emporium,
        staleTime: 30000,
        placeholderData: (previousData) => previousData,
        select: (data: Logs): UseMarketLogsResult => ({
            logs: data.logs.map(([timestamp, log]) => transformLogEntry(log, "")), // Empty string for market logs
            totalPages: Number(data.total_pages),
        }),
    });
};