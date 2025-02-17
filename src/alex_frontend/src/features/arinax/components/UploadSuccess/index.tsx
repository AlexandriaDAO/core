import React, { useEffect, useState } from "react";
import { ExternalLink, Copy, CheckCircle2, ArrowUpToLine, LoaderPinwheel, RotateCw, Clock } from "lucide-react";
import { toast } from "sonner";
import { Header } from "./Header";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import MintNFT from "./MintNFT";
import Arweave from "arweave";
import { Button } from "@/lib/components/button";
import { TransactionStatusResponse } from "arweave/node/transactions";

interface UploadSuccessProps {
	file: File;
}

const UploadSuccess: React.FC<UploadSuccessProps> = ({
	file,
}) => {
	const { transaction,details} = useAppSelector(state=>state.arinax);
	const [status, setStatus] = useState<TransactionStatusResponse>();
	const [loading, setLoading] = useState(false);

	if(!transaction) return null;
	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			toast.success("Copied to clipboard");
		} catch (err) {
			console.error("Failed to copy text: ", err);
			toast.error("Failed to copy text");
		}
	};

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


	const fileUrl = 'https://arweave.net/'+transaction;
	const txUrl = 'https://arweave.net/tx/'+transaction;

	return (
		<div className="bg-secondary rounded-lg shadow-md">
			<Header file={file}/>

			{/* Details Section */}
			{details && (
				<div className="p-4 space-y-4">
					{/* File Hash */}
					<div className="flex items-center justify-between">
						<span className="text-sm text-gray-500">
							Tx Hash:
						</span>
						<div className="flex items-center space-x-2">
							<code className="px-2 py-1 border bg-white dark:bg-transparent rounded text-sm font-mono">
								{transaction.substring(0, 20)}...
							</code>
							<button
								onClick={() => copyToClipboard(transaction)}
								className="p-1 hover:bg-gray-100 rounded-full transition-colors"
								title="Copy hash"
							>
								<Copy
									className="w-4 h-4 text-gray-500"
									strokeWidth={2}
								/>
							</button>
						</div>
					</div>

					{/* File URL */}
					<div className="flex items-center justify-between">
						<span className="text-sm text-gray-500">
							File URL:
						</span>
						<div className="flex items-center space-x-2">
							<a
								href={fileUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary/80 hover:text-primary flex items-center"
							>
								View file
								<ExternalLink
									className="w-4 h-4 ml-1"
									strokeWidth={2}
								/>
							</a>
							<button
								onClick={() => copyToClipboard(fileUrl)}
								className="p-1 hover:bg-gray-100 rounded-full transition-colors"
								title="Copy URL"
							>
								<Copy
									className="w-4 h-4 text-gray-500"
									strokeWidth={2}
								/>
							</button>
						</div>
					</div>

					{/* Transaction URL */}
					<div className="flex items-center justify-between">
						<span className="text-sm text-gray-500">
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
							<button
								onClick={() => copyToClipboard(txUrl)}
								className="p-1 hover:bg-gray-100 rounded-full transition-colors"
								title="Copy URL"
							>
								<Copy
									className="w-4 h-4 text-gray-500"
									strokeWidth={2}
								/>
							</button>
						</div>
					</div>

					{/* Confirmation Status */}
					<div className="flex items-center justify-between">
						<span className="text-sm text-gray-500">
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
								{/* <Clock className="w-4 h-4 ml-1 text-yellow-700" /> */}
{/* 
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
										className={`w-4 h-4 text-yellow-700 ${
											loading ? 'animate-spin' : ''
										}`}
										strokeWidth={2}
									/>
								</Button> */}
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
										className={`w-4 h-4 text-gray-500 ${
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

					<MintNFT />

				</div>
			)}
		</div>
	);
};

export default UploadSuccess;
