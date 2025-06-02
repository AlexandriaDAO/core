import React, { useEffect, useState } from "react";
import { Check, RotateCw } from "lucide-react";
import { Button } from "@/lib/components/button";
import { TransactionStatusResponse } from "arweave/node/transactions";
import { arweaveClient } from "@/utils/arweaveClient";

interface TransactionStatusProps {
	transaction: string;
}

const TransactionStatus: React.FC<TransactionStatusProps> = ({ transaction }) => {
	const [status, setStatus] = useState<TransactionStatusResponse>();
	const [loading, setLoading] = useState(false);

	const fetchStatus = async () => {
		setLoading(true);
		try {
			const res = await arweaveClient.transactions.getStatus(transaction);
			setStatus(res);
		} catch (error) {
			console.error('Error checking status:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchStatus();
	}, []);

	return (
        <>
            {/* Confirmation Status */}
            <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                    Transaction Status:
                </span>
                <div className="flex items-center space-x-2">
                    {status && ( status.status === 200 ? <>
                        <div className="p-1 text-sm bg-green-100 text-green-700">
                            <span>Confirmed</span>
                        </div>
                        <Check className="w-6 h-6 text-constructive" />
                    </>: <>
                        {!loading && <div className="p-1 text-sm bg-yellow-100 text-yellow-700">
                            <span>Pending</span>
                        </div>}
                    </>)}

                    {(!status || status.status !== 200) && (
                        <Button
                            variant="secondary"
                            scale="sm"
                            onClick={fetchStatus}
                            disabled={loading}
                            className={`p-1 flex items-center space-x-2 transition-colors ${
                                loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            title="Refresh status"
                        >
                            {loading && <span>Checking...</span>}
                            <RotateCw 
                                className={`w-5 h-5 text-muted-foreground hover:text-muted-foreground/50 ${
                                    loading ? 'animate-spin' : ''
                                }`}
                                strokeWidth={2}
                            />
                        </Button>
                    )}
                </div>
            </div>

            {/* Number of Confirmations */}
            {status && status.status === 200 && (
                <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">
                        Block Height:
                    </span>
                    <div className="font-roboto-condensed text-lg text-green-600">
                        {status.confirmed?.block_height}
                    </div>
                </div>
            )}
        </>
	);
};

export default TransactionStatus;
