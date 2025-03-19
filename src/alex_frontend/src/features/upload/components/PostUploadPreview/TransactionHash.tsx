import React from "react";
import Copy from "@/components/Copy";
interface TransactionHashProps {
	transaction: string;
}

const TransactionHash: React.FC<TransactionHashProps> = ({ transaction}) => {
	return (
        <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">
                Tx Hash:
            </span>
            <div className="flex items-center space-x-2">
                <code className="px-2 py-1 border bg-white dark:bg-transparent rounded text-sm font-mono">{transaction}</code>
                <Copy text={transaction} />
            </div>
        </div>
	);
};

export default TransactionHash;
