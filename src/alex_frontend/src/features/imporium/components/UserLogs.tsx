import React, { useCallback } from "react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import getUserLogs from "../thunks/getUserLog";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import Copy from "@/components/Copy";
import useEmporium from "@/hooks/actors/useEmporium";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/lib/components/table";
import ReactPaginate from 'react-paginate';
import "./style.css"

const UserLogs: React.FC = () => {
    const dispatch = useAppDispatch();
    const { actor } = useEmporium();
    const { logs, totalPages, pageSize, currentPage } = useAppSelector((state) => state.imporium);

    const handlePageClick = useCallback((event: { selected: number }) => {
        if (!actor) return;
        dispatch(getUserLogs({ actor, page: event.selected + 1, pageSize }));
    }, [actor, pageSize]);

    return (
        <div className="">
            <Table className="rounded-md border">
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-lg font-bold text-[#333] font-[Syne] whitespace-nowrap dark:text-white">Timestamp</TableHead>
                        <TableHead className="text-lg font-bold text-[#333] font-[Syne] whitespace-nowrap dark:text-white">Token ID</TableHead>
                        <TableHead className="text-lg text-center font-bold text-[#333] font-[Syne] whitespace-nowrap dark:text-white">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs && Array.isArray(logs) && logs.length > 0 ? logs.map((log, index) => (
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
                                <div className="overflow-x-auto text-center">
                                    <div className="text-[15px] p-0 whitespace-nowrap bg-[transparent] border-[0] font-medium font-[Syne] dark:text-white">
                                        {log.action.type === "PriceUpdate" && `📈 Price Changed: ${Number(log.action.oldPrice) / 1e8} → ${Number(log.action.newPrice) / 1e8} ICP`}
                                        {log.action.type === "Sold" && `🎉 ${'isBuyer' in log.action && log.action.isBuyer ? "Purchased" : "Sold"} ${'price' in log.action ? `for ${Number(log.action.price) / 1e8} ICP` : ''}`}
                                        {log.action.type === "Listed" && `🏷️ ${'price' in log.action ? `Listed at ${Number(log.action.price) / 1e8} ICP` : 'Listed'}`}
                                        {log.action.type === "Removed" && `🚫 Delisted`}
                                    </div>
                                    {log.buyer && (
                                        <div className="mt-[10px] text-sm text-[#333] whitespace-nowrap dark:text-white">
                                            🛒 <b>{'isBuyer' in log.action && log.action.isBuyer ? "Seller" : "Buyer"}:</b>
                                            <span className="text-[#333] dark:text-white">
                                                {'isBuyer' in log.action && log.action.isBuyer ? log.seller : log.buyer}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center">No logs found</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 0 && (
                <div className="flex justify-center my-8">
                    <ReactPaginate
                        previousLabel="←"
                        nextLabel="→"
                        breakLabel="..."
                        pageCount={totalPages}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={3}
                        onPageChange={handlePageClick}
                        forcePage={currentPage > 0 ? currentPage - 1 : 0}
                        containerClassName="flex items-center gap-1"
                        pageLinkClassName="flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-accent transition-colors duration-200"
                        previousLinkClassName="flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-accent transition-colors duration-200"
                        nextLinkClassName="flex items-center justify-center w-10 h-10 rounded-lg border border-border hover:bg-accent transition-colors duration-200"
                        breakLinkClassName="flex items-center justify-center w-10 h-10 text-muted-foreground"
                        activeLinkClassName="!bg-primary text-white hover:!bg-primary/90"
                        disabledLinkClassName="opacity-50 cursor-not-allowed hover:bg-transparent"
                    />
                </div>
            )}
        </div>
    );
};

export default UserLogs;