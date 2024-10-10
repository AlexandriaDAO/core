import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Transaction, ContentListProps } from "../types/queries";
import { getCover } from "@/utils/epub";
import ContentGrid from "./ContentGrid";
import { supportedFileTypes } from "../types/files";
import { mint_nft } from "../../nft/mint";
import { FaPlay, FaFileAlt, FaFilePdf, FaFileCode, FaFileAudio, FaImage, FaExclamationTriangle } from 'react-icons/fa';
import { RootState } from "@/store";
import { setMintableState, setMintableStates } from "../redux/arweaveSlice";
import ContentValidator, { loadModel, isModelLoaded } from './ContentValidator';
import { setNsfwModelLoaded } from "../redux/arweaveSlice";

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

const ContentList: React.FC<ContentListProps> = ({ transactions, onSelectContent }) => {
	const dispatch = useDispatch();
	const [contentUrls, setContentUrls] = useState<Record<string, string | null>>({});
	const [renderErrors, setRenderErrors] = useState<Record<string, boolean>>({});
	const mintableState = useSelector((state: RootState) => state.arweave.mintableState);

	useEffect(() => {
		// Immediately set all transactions' mintable states to false
		const initialMintableStates = transactions.reduce((acc, transaction) => {
			acc[transaction.id] = false;
			return acc;
		}, {} as Record<string, boolean>);
		dispatch(setMintableStates(initialMintableStates));

		const loadContent = async () => {
			for (const transaction of transactions) {
				try {
					const defaultContentType = "image/jpeg";
					const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || defaultContentType;
					const handler = contentTypeHandlers[contentType as keyof typeof contentTypeHandlers];
					if (handler) {
						const url = await handler(transaction.id);
						setContentUrls(prev => ({ ...prev, [transaction.id]: url }));
					}
				} catch (error) {
					console.warn(`Error loading content for ${transaction.id}:`, error);
					setContentUrls(prev => ({ ...prev, [transaction.id]: null }));
					setRenderErrors(prev => ({ ...prev, [transaction.id]: true }));
				}
			}
		};

		loadContent();
	}, [transactions, dispatch]);

	useEffect(() => {
		if (!isModelLoaded()) {
			loadModel().then(() => {
				dispatch(setNsfwModelLoaded(true));
			}).catch(error => {
				console.error("Failed to load NSFW model:", error);
				dispatch(setNsfwModelLoaded(false));
			});
		}
	}, [dispatch]);

	const handleMint = async (transactionId: string) => {
		try {
			await mint_nft(transactionId);
			alert("NFT minted successfully!");
		} catch (error) {
			console.error("Error minting NFT:", error);
			alert("Failed to mint NFT. Please try again.");
		}
	};

	const handleRenderError = (transactionId: string) => {
		setRenderErrors(prev => ({ ...prev, [transactionId]: true }));
		dispatch(setMintableState({ id: transactionId, mintable: false }));
	};

	const handleRenderSuccess = (transactionId: string) => {
		dispatch(setMintableState({ id: transactionId, mintable: true }));
	};

	const renderDetails = (transaction: Transaction) => (
		<div className="absolute inset-0 bg-black bg-opacity-80 p-2 overflow-y-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs text-gray-300">
			<p><span className="font-semibold">ID:</span> {transaction.id}</p>
			<p><span className="font-semibold">Owner:</span> {transaction.owner}</p>
			{transaction.data && (
				<p><span className="font-semibold">Size:</span> {transaction.data.size} bytes</p>
			)}
			{transaction.block && (
				<p>
					<span className="font-semibold">Date (UTC):</span>{' '}
					{new Date(transaction.block.timestamp * 1000).toUTCString()}
				</p>
			)}
			<p className="font-semibold mt-2">Tags:</p>
			{transaction.tags.map((tag, index) => (
				<p key={index} className="ml-2">
					<span className="font-semibold">{tag.name}:</span> {tag.value}
				</p>
			))}
		</div>
	);

	const renderContent = (transaction: Transaction, contentUrl: string | null) => {
		const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || "application/epub+zip";

		if (renderErrors[transaction.id]) {
			return (
				<div className="w-full h-full bg-red-100 flex flex-col items-center justify-center text-red-500">
					<FaExclamationTriangle className="text-4xl mb-2" />
					<span className="text-sm">Failed to load</span>
				</div>
			);
		}

		if (contentUrl) {
			// Add ContentValidator
			return (
				<>
					<ContentValidator
						transactionId={transaction.id}
						contentUrl={contentUrl}
						contentType={contentType}
					/>
					{contentType.startsWith("video/") ? (
						<div className="relative w-full h-full bg-gray-800 flex items-center justify-center">
							<FaPlay className="text-white text-4xl" />
							<video
								src={contentUrl}
								className="absolute inset-0 w-full h-full object-cover opacity-50"
								onError={() => handleRenderError(transaction.id)}
							/>
						</div>
					) : contentType.startsWith("image/") || contentType === "application/epub+zip" ? (
						<img 
							src={contentUrl} 
							alt={contentType === "application/epub+zip" ? "Book cover" : "Content image"}
							className="absolute inset-0 w-full h-full object-cover"
							onError={() => handleRenderError(transaction.id)}
						/>
					) : contentType === "application/pdf" ? (
						<div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
							<FaFilePdf className="text-gray-500 text-4xl absolute" />
							<embed
								src={`${contentUrl}#view=FitH&page=1`}
								type="application/pdf"
								className="absolute inset-0 w-full h-full opacity-50"
								onError={() => handleRenderError(transaction.id)}
							/>
						</div>
					) : null}
				</>
			);
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
							{mintableState[transaction.id] && (
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
						</div>
					</ContentGrid.Item>
				);
			})}
		</ContentGrid>
	);
};

export default ContentList;