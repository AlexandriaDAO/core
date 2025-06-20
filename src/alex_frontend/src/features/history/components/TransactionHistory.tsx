import React from "react";
import { Info } from "lucide-react";
import { TransactionType } from "../historySlice";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import TransactionHistoryObj from "./TransactionHistoryObj";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/lib/components/tooltip";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/lib/components/table";

const TransactionHistory = () => {
    const history = useAppSelector((state) => state.history);
    const {user} = useAppSelector(state=>state.auth);

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">Transaction History</h2>
                <p className="text-sm text-muted-foreground">
                    {user ? 'View your recent transaction activity across all tokens': 'View recent Public transactions across all tokens'}
                </p>
            </div>

            {/* Table Section */}
            <TooltipProvider delayDuration={0}>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <span>Type</span>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="h-4 w-4 border border-muted-foreground/30 flex justify-center items-center rounded-full cursor-help hover:border-muted-foreground/60 transition-colors">
                                                    <Info size={10} className="text-muted-foreground" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Transaction type</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TableHead>
                                <TableHead className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <span>Amount</span>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="h-4 w-4 border border-muted-foreground/30 flex justify-center items-center rounded-full cursor-help hover:border-muted-foreground/60 transition-colors">
                                                    <Info size={10} className="text-muted-foreground" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Transaction amount</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TableHead>
                                <TableHead className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <span>Status</span>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="h-4 w-4 border border-muted-foreground/30 flex justify-center items-center rounded-full cursor-help hover:border-muted-foreground/60 transition-colors">
                                                    <Info size={10} className="text-muted-foreground" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Transaction status</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TableHead>
                                <TableHead className="font-medium">Date</TableHead>
                                <TableHead className="font-medium">Fee</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.transactions?.map((trx: TransactionType, i: number) => (
                                <TransactionHistoryObj key={`${trx.timestamp}_${i}`} transaction={trx} index={i} />
                            ))}
                            {(!history.transactions || history.transactions.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No transactions found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </TooltipProvider>
        </div>
    );
};

export default TransactionHistory;