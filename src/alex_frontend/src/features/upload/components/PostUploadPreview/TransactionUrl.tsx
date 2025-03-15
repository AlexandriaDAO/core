import React from "react";
import { ExternalLink } from "lucide-react";
import Copy from "@/components/Copy";

interface TransactionUrlProps {
	transaction: string;
}

const TransactionUrl: React.FC<TransactionUrlProps> = ({ transaction }) => {
	const txUrl = 'https://arweave.net/tx/'+transaction;

	return (
        <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">
                Transaction URL:
            </span>
            <div className="flex items-center space-x-2">
                <a
                    href={txUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary/80 hover:text-primary flex items-center"
                >
                    View transaction
                    <ExternalLink
                        className="w-4 h-4 ml-1"
                        strokeWidth={2}
                    />
                </a>
                <Copy text={txUrl} />
            </div>
        </div>
	);
};

export default TransactionUrl;
