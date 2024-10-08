import React, { useState, useEffect } from "react";
import { Transaction, ContentListProps } from "./types/queries";
import { getCover } from "@/utils/epub";
import ContentGrid from "./ContentGrid";
import { supportedFileTypes } from "./types/files";
import { mint_nft } from "../NFT/mint";
import { FaPlay, FaFileAlt, FaFilePdf, FaFileCode, FaFileAudio, FaImage } from 'react-icons/fa';

const contentTypeHandlers: Record<string, (id: string) => Promise<string | null> | string> = {
  "application/epub+zip": async (id: string) => {
    const url = await getCover(`https://arweave.net/${id}`);
    return url || `https://arweave.net/${id}`;
  },
  "application/pdf": (id: string) => `https://arweave.net/${id}`,
};

supportedFileTypes.forEach(type => {
  if (type.mimeType.startsWith("image/") || type.mimeType.startsWith("video/")) {
    contentTypeHandlers[type.mimeType] = (id: string) => `https://arweave.net/${id}`;
  }
});

const getFileIcon = (contentType: string) => {
  if (contentType.startsWith("image/")) return <FaImage />;
  if (contentType.startsWith("video/")) return <FaPlay />;
  if (contentType.startsWith("audio/")) return <FaFileAudio />;
  if (contentType === "application/pdf") return <FaFilePdf />;
  if (["text/plain", "text/markdown", "application/json", "text/html"].includes(contentType)) return <FaFileCode />;
  return <FaFileAlt />;
};

export default function ContentList({ transactions, onSelectContent, showMintButton = false }: ContentListProps) {
	const [contentUrls, setContentUrls] = useState<Record<string, string | null>>({});

	useEffect(() => {
		const loadContent = async () => {
			for (const transaction of transactions) {
				try {
					const defaultContentType = "image/jpeg"; // Default to images
					const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || defaultContentType;
					const handler = contentTypeHandlers[contentType as keyof typeof contentTypeHandlers];
					if (handler) {
						const url = await handler(transaction.id);
						setContentUrls(prev => ({ ...prev, [transaction.id]: url }));
					}
				} catch (error) {
					console.warn(`Error loading content for ${transaction.id}:`, error);
					setContentUrls(prev => ({ ...prev, [transaction.id]: null }));
				}
			}
		};

		loadContent();
	}, [transactions]);

	const handleMint = async (transactionId: string) => {
		try {
			await mint_nft(transactionId);
			alert("NFT minted successfully!");
		} catch (error) {
			console.error("Error minting NFT:", error);
			alert("Failed to mint NFT. Please try again.");
		}
	};

	const renderDetails = (transaction: Transaction) => (
		<div className="absolute inset-0 bg-black bg-opacity-80 p-2 overflow-y-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs text-gray-300">
			<p><span className="font-semibold">ID:</span> {transaction.id}</p>
			<p><span className="font-semibold">Owner:</span> {transaction.owner}</p>
			{transaction.data && (
				<p><span className="font-semibold">Size:</span> {transaction.data.size} bytes</p>
			)}
			{transaction.block && (
				<p><span className="font-semibold">Date:</span> {new Date(transaction.block.timestamp * 1000).toLocaleString()}</p>
			)}
			<p className="font-semibold mt-2">Tags:</p>
			{transaction.tags.map((tag, index) => (
				<p key={index} className="ml-2">
					<span className="font-semibold">{tag.name}:</span> {tag.value}
					{showMintButton && (
						<button
							onClick={(e) => {
								e.stopPropagation();
								handleMint(transaction.id);
							}}
							className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
						>
							+
						</button>
					)}
				</p>
			))}
		</div>
	);

	const renderContent = (transaction: Transaction, contentUrl: string | null) => {
		const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || "application/epub+zip";

		if (contentUrl) {
			if (contentType.startsWith("video/")) {
				return (
					<div className="relative w-full h-full bg-gray-800 flex items-center justify-center">
						<FaPlay className="text-white text-4xl" />
						<video
							src={contentUrl}
							className="absolute inset-0 w-full h-full object-cover opacity-50"
						/>
					</div>
				);
			} else if (contentType.startsWith("image/") || contentType === "application/epub+zip") {
				return (
					<img 
						src={contentUrl} 
						alt={contentType === "application/epub+zip" ? "Book cover" : "Content image"}
						className="absolute inset-0 w-full h-full object-cover"
					/>
				);
			} else if (contentType === "application/pdf") {
				return (
					<div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
						<FaFilePdf className="text-gray-500 text-4xl absolute" />
						<embed
							src={`${contentUrl}#view=FitH&page=1`}
							type="application/pdf"
							className="absolute inset-0 w-full h-full opacity-50"
						/>
					</div>
				);
			}
		}

		return (
			<div className="w-full h-full bg-gray-200 flex items-center justify-center">
				{getFileIcon(contentType)}
			</div>
		);
	};

	return (
		<ContentGrid>
			{transactions.map((transaction) => {
				const contentUrl = contentUrls[transaction.id];
				const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || "application/epub+zip";

				return (
					<ContentGrid.Item
						key={transaction.id}
						onClick={() => onSelectContent(transaction.id, contentType)}
					>
						<div className="group relative w-full h-full">
							{renderContent(transaction, contentUrl)}
							{renderDetails(transaction)}
						</div>
					</ContentGrid.Item>
				);
			})}
		</ContentGrid>
	);
}