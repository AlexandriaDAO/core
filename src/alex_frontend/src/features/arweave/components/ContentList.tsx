import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Transaction, ContentListProps } from "../types/queries";
import { getCover } from "@/utils/epub";
import ContentGrid from "./ContentGrid";
import { supportedFileTypes } from "../types/files";
import { mint_nft } from "../../nft/mint";
import { FaPlay, FaFileAlt, FaFilePdf, FaFileCode, FaFileAudio, FaImage, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { RootState } from "@/store";
import { setMintableStates, setMintableState, MintableStateItem } from "../redux/arweaveSlice";
import ContentValidator, { loadModel, isModelLoaded } from './ContentValidator';
import { setNsfwModelLoaded } from "../redux/arweaveSlice";
import { ARWEAVE_CONFIG, getProxiedArweaveUrl } from '../config/arweaveConfig';

const contentTypeHandlers: Record<string, (id: string) => Promise<string | null> | string> = {
  "application/epub+zip": async (id: string) => {
    const url = await getCover(getProxiedArweaveUrl(id));
    return url || getProxiedArweaveUrl(id);
  },
  "application/pdf": (id: string) => getProxiedArweaveUrl(id),
};

supportedFileTypes.forEach(type => {
  if (type.mimeType.startsWith("image/") || type.mimeType.startsWith("video/")) {
    contentTypeHandlers[type.mimeType] = (id: string) => getProxiedArweaveUrl(id);
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
	const [showStats, setShowStats] = useState<Record<string, boolean>>({});

	useEffect(() => {
		// Reset contentUrls and renderErrors when transactions change
		setContentUrls({});
		setRenderErrors({});

		// Reset showStats when transactions change
		setShowStats({});

		// Set initial mintable states for new transactions
		const initialMintableStates = transactions.reduce((acc, transaction) => {
			acc[transaction.id] = { mintable: false };
			return acc;
		}, {} as Record<string, MintableStateItem>);
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

	const renderDetails = (transaction: Transaction) => (
		<div className="absolute inset-0 bg-black bg-opacity-80 p-2 overflow-y-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs text-gray-300 z-10">
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

		const mintableStateItem = mintableState[transaction.id];
		const isMintable = mintableStateItem?.mintable;
		const predictions = mintableStateItem?.predictions;

		if (renderErrors[transaction.id]) {
			return (
				<div className="w-full h-full bg-red-100 flex flex-col items-center justify-center text-red-500">
					<FaExclamationTriangle className="text-4xl mb-2" />
					<span className="text-sm">Failed to load</span>
				</div>
			);
		}

		if (contentUrl) {
			return (
				<div className="relative w-full h-full">
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
							crossOrigin="anonymous"
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

					{/* Stats overlay */}
					{(showStats[transaction.id] || !isMintable) && predictions && (
						<div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white p-2 z-20">
							<p className="text-lg font-bold mb-2">Content Classification</p>
							<ul className="text-sm">
								<li>Drawing: {(predictions['Drawing'] * 100).toFixed(2)}%</li>
								<li>Hentai: {(predictions['Hentai'] * 100).toFixed(2)}%</li>
								<li>Neutral: {(predictions['Neutral'] * 100).toFixed(2)}%</li>
								<li>Porn: {(predictions['Porn'] * 100).toFixed(2)}%</li>
								<li>Sexy: {(predictions['Sexy'] * 100).toFixed(2)}%</li>
							</ul>
							{!isMintable && (
								<p className="mt-2 text-red-400">This content is not mintable.</p>
							)}
						</div>
					)}
				</div>
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
				const mintableStateItem = mintableState[transaction.id];
				const isMintable = mintableStateItem?.mintable;
				const predictions = mintableStateItem?.predictions;

				return (
					<ContentGrid.Item
						key={transaction.id}
						onClick={() => onSelectContent(transaction.id, contentType)}
					>
						<div className="group relative w-full h-full">
							{renderContent(transaction, contentUrl)}
							{renderDetails(transaction)}
							
							{/* Stats button */}
							{isMintable && predictions && (
								<button
									onClick={(e) => {
										e.stopPropagation();
										setShowStats(prev => ({ ...prev, [transaction.id]: !prev[transaction.id] }));
									}}
									className="absolute top-2 left-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center z-30"
								>
									<FaInfoCircle />
								</button>
							)}

							{/* Mint button */}
							{isMintable && (
								<button
									onClick={(e) => {
										e.stopPropagation();
										handleMint(transaction.id);
									}}
									className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center z-30"
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
