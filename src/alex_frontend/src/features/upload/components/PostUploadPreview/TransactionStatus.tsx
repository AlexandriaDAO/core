import React, { useEffect, useState } from "react";
import { CheckCircle2, RotateCw } from "lucide-react";
import Arweave from "arweave";
import { Button } from "@/lib/components/button";
import { TransactionStatusResponse } from "arweave/node/transactions";

interface TransactionStatusProps {
	transaction: string;
}

const TransactionStatus: React.FC<TransactionStatusProps> = ({ transaction }) => {
	const [status, setStatus] = useState<TransactionStatusResponse>();
	const [loading, setLoading] = useState(false);

	const fetchStatus = async () => {
		setLoading(true);
		try {
			const arweave = Arweave.init({});
			const res = await arweave.transactions.getStatus(transaction);
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
                <span className="text-lg font-semibold text-primary">
                    Transaction Status:
                </span>
                <div className="flex items-center space-x-2">
                    {status && ( status.status === 200 ? <>
                        <div className="p-1 rounded-full text-sm bg-green-100 text-green-700">
                            <span>Confirmed</span>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-green-700" />
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
                                className={`w-4 h-4 text-primary hover:text-primary/50 ${
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
                    <span className="text-sm text-gray-500">
                        Block Height:
                    </span>
                    <div className="font-roboto-condensed text-sm text-green-600">
                        {status.confirmed?.block_height}
                    </div>
                </div>
            )}
        </>
	);
};

export default TransactionStatus;
