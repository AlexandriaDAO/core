import React from "react";
import { ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import { Header } from "./Header";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import MintNFT from "./MintNFT";

interface UploadSuccessProps {
	file: File;
}

const UploadSuccess: React.FC<UploadSuccessProps> = ({
	file,
}) => {
	const {transaction, details} = useAppSelector(state=>state.fileUpload);
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

	const fileUrl = 'https://gateway.irys.xyz/'+transaction;
	const txUrl = 'https://gateway.irys.xyz/tx/'+transaction;

	return (
		<div className="bg-white rounded-lg shadow-md">
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
							<code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
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
								className="text-blue-500 hover:text-blue-600 flex items-center"
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
								className="text-blue-500 hover:text-blue-600 flex items-center"
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

					<MintNFT />

				</div>
			)}
		</div>
	);
};

export default UploadSuccess;
