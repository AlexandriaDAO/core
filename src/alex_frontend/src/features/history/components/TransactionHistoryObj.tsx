import React from "react";
import { Check } from "lucide-react";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { setSelectedTransaction } from "../historySlice";
import { TransactionType } from "../historySlice";
import { TableRow, TableCell } from "@/lib/components/table";
import { Badge } from "@/lib/components/badge";

const TransactionHistoryObj: React.FC<{
    transaction: TransactionType;
    index: number;
}> = ({ transaction, index }) => {
    const dispatch = useAppDispatch();
    const { selectedTransaction } = useAppSelector((state) => state.history);

    const handleClick = () => {
        dispatch(setSelectedTransaction(transaction));
    };

    const isSelected = selectedTransaction && 
        selectedTransaction.timestamp === transaction.timestamp && 
        selectedTransaction.from === transaction.from && 
        selectedTransaction.to === transaction.to;

    const getTransactionTypeVariant = (type: string) => {
        switch (type.toLowerCase()) {
            case 'mint':
                return 'default';
            case 'transfer':
                return 'secondary';
            case 'burn':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <TableRow 
            className={`cursor-pointer transition-colors ${
                isSelected ? 'bg-muted/50' : 'hover:bg-muted/30'
            }`}
            onClick={handleClick}
        >
            <TableCell>
                <Badge variant={getTransactionTypeVariant(transaction.type)} className="capitalize">
                    {transaction.type}
                </Badge>
            </TableCell>
            <TableCell className="font-medium">
                {transaction.amount}
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Check size={14} className="text-green-500" />
                    <span className="text-sm text-green-600">Completed</span>
                </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {formatDate(transaction.timestamp)}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {transaction.fee}
            </TableCell>
        </TableRow>
    );
};

export default TransactionHistoryObj;