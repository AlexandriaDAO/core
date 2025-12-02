import React from "react";
import Copy from "@/components/Copy";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/lib/components/table";
import { TransformedLog, PriceUpdateAction, SoldAction, ListedAction } from "../types";

interface LogsTableProps {
    logs: TransformedLog[];
    emptyMessage?: string;
}

const LogsTable: React.FC<LogsTableProps> = ({ logs, emptyMessage = "No logs found yet." }) => {
    if (!logs || logs.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <Table className="rounded-md border">
            <TableHeader>
                <TableRow>
                    <TableHead className="text-lg font-bold text-[#333] font-[Syne] whitespace-nowrap dark:text-white">
                        Timestamp
                    </TableHead>
                    <TableHead className="text-lg font-bold text-[#333] font-[Syne] whitespace-nowrap dark:text-white">
                        Token ID
                    </TableHead>
                    <TableHead className="text-lg font-bold text-[#333] font-[Syne] whitespace-nowrap dark:text-white">
                        Owner
                    </TableHead>
                    <TableHead className="text-lg text-center font-bold text-[#333] font-[Syne] whitespace-nowrap dark:text-white">
                        Action
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {logs.map((log, index) => (
                    <TableRow
                        key={log.timestamp}
                        className={`hover:bg-[#F3F3F2] dark:hover:bg-gray-600 ${
                            index % 2 === 0
                                ? "bg-gray-100 dark:bg-[#2D2A26]"
                                : "bg-white dark:bg-[#3A3630]"
                        }`}
                    >
                        <TableCell>
                            🕒 {new Date(parseInt(log.timestamp) / 1e6).toLocaleString()}
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                {log.token_id.slice(0, 5) + "..." + log.token_id.slice(-4)}
                                <Copy text={log.token_id} size="sm"/>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                {log.seller.slice(0, 5) + "..." + log.seller.slice(-4)}
                                <Copy text={log.seller} size="sm"/>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="overflow-x-auto text-center">
                                <div className="text-[15px] p-0 whitespace-nowrap bg-[transparent] border-[0] font-medium font-[Syne] dark:text-white">
                                    {log.action.type === "PriceUpdate" && 
                                        `📈 Price Changed: ${Number((log.action as PriceUpdateAction).oldPrice) / 1e8} → ${Number((log.action as PriceUpdateAction).newPrice) / 1e8} ICP`
                                    }
                                    {log.action.type === "Sold" && 
                                        `🎉 ${'isBuyer' in log.action && (log.action as SoldAction).isBuyer ? "Purchased" : "Sold"} ${'price' in log.action ? `for ${Number((log.action as SoldAction).price) / 1e8} ICP` : ''}`
                                    }
                                    {log.action.type === "Listed" && 
                                        `🏷️ ${'price' in log.action ? `Listed at ${Number((log.action as ListedAction).price) / 1e8} ICP` : 'Listed'}`
                                    }
                                    {log.action.type === "Removed" && `🚫 Delisted`}
                                </div>
                                {log.buyer && (
                                    <div className="mt-[10px] text-sm text-[#333] whitespace-nowrap dark:text-white">
                                        🛒 <b>{'isBuyer' in log.action && (log.action as SoldAction).isBuyer ? "Seller" : "Buyer"}:</b>
                                        <span className="text-[#333] dark:text-white">
                                            {'isBuyer' in log.action && (log.action as SoldAction).isBuyer ? log.seller : log.buyer}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default LogsTable;