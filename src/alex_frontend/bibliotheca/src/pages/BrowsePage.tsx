import React, { useEffect, useState } from "react";
import { Button } from "@/lib/components/button";
import {
	Database,
	Globe,
	ArrowDown,
	BookOpen,
	Coins,
	AlertCircle,
	Loader2,
} from "lucide-react";
import { BookCard } from "@/features/bibliotheca/components/BookCard";
import { BookModal } from "@/features/bibliotheca/components/BookModal";
import { MintButton } from "@/features/bibliotheca/components/MintButton";
import { useArweaveBooks } from "@/features/bibliotheca/hooks/useArweaveBooks";
import { fetchBooks } from "@/features/bibliotheca/browse/thunks/fetchBooks";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { ArweaveBook, Book } from "@/features/bibliotheca/types";
import { AudioBook } from "@/features/bibliotheca/components/AudioBook";

const BrowsePage: React.FC = () => {
	const dispatch = useAppDispatch();
	const { books, loading, error, hasNext, loadMore, isEmpty } =
		useArweaveBooks();
	const [modalBookUrl, setModalBookUrl] = useState<string>("");
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Convert ArweaveBook to Book format for BookCard
	const convertToBook = (arweaveBook: ArweaveBook): Book => {
		// Try to get content type from data.type or Content-Type tag
		let contentType = arweaveBook.data?.type;
		if (!contentType) {
			const contentTypeTag = arweaveBook.tags?.find(
				(tag) => tag.name === "Content-Type"
			);
			contentType = contentTypeTag?.value || "";
		}

		return {
			id: arweaveBook.id,
			type: contentType,
			size: arweaveBook.data?.size || null,
			timestamp: new Date(
				arweaveBook.block.timestamp * 1000
			).toISOString(),
		};
	};

	// Fetch initial data on mount
	useEffect(() => {
		if (books.length === 0 && !loading && !error) {
			dispatch(fetchBooks({ reset: true }));
		}
	}, [dispatch, books.length, loading, error]);

	const formatFileSize = (sizeString: string | null) => {
		if (!sizeString) return "Unknown size";
		const size = parseInt(sizeString);
		if (isNaN(size)) return "Unknown size";
		if (size < 1024 * 1024) {
			return `${(size / 1024).toFixed(1)} KB`;
		}
		return `${(size / (1024 * 1024)).toFixed(1)} MB`;
	};

	// Modal handlers
	const handleBookClick = (book: Book) => {
		const bookUrl =
			book.id.startsWith("blob:") || book.id.includes(".")
				? book.id
				: `https://arweave.net/${book.id}`;
		setModalBookUrl(bookUrl);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setModalBookUrl("");
	};

	return (
		<div className="grid grid-cols-5 min-h-full gap-6">
			{/* Left Sidebar */}
			<div className="col-span-1 flex flex-col gap-4 items-center sticky top-0 h-fit">
				<div className="w-full bg-card rounded-lg border p-5">
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Database size={20} className="text-primary" />
							<h3 className="font-semibold">From Arweave</h3>
						</div>
						<p className="text-sm text-muted-foreground">
							Book files from the permanent web, ready to discover
							and mint.
						</p>
						<div className="space-y-2 text-xs text-muted-foreground">
							<div className="flex items-center gap-2">
								<Globe size={12} />
								<span>Permanent storage</span>
							</div>
							<div className="flex items-center gap-2">
								<BookOpen size={12} />
								<span>Always accessible</span>
							</div>
							<div className="flex items-center gap-2">
								<Coins size={12} />
								<span>Ready to mint</span>
							</div>
						</div>
					</div>
				</div>

				<div className="w-full bg-card rounded-lg border p-5">
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Coins size={20} className="text-primary" />
							<h3 className="font-semibold">Create NFTs</h3>
						</div>
						<p className="text-sm text-muted-foreground">
							Transform any audio into a tradeable NFT on
							Alexandria.
						</p>
						<div className="space-y-2">
							<div className="text-xs text-muted-foreground">
								<p className="font-medium text-foreground mb-1">
									Quick steps:
								</p>
								<ul className="space-y-1">
									<li>• Click mint icon on any book</li>
									<li>• Confirm the transaction</li>
									<li>• Own the NFT permanently</li>
								</ul>
							</div>
						</div>
						<div className="pt-2 border-t">
							<p className="text-xs text-muted-foreground">
								{loading && books.length === 0 ? (
									"Loading files..."
								) : (
									<>
										<span className="font-medium">
											{books.length}
										</span>{" "}
										files available
									</>
								)}
							</p>
						</div>
					</div>
				</div>

				{/* Load More */}
				{hasNext && (
					<Button
						variant="outline"
						className="gap-2"
						onClick={loadMore}
						disabled={loading}
					>
						{loading ? (
							<Loader2 size={16} className="animate-spin" />
						) : (
							<ArrowDown size={16} />
						)}
						{loading ? "Loading..." : "Load More"}
					</Button>
				)}
			</div>

			{/* Book Grid */}
			<div className="col-span-4 overflow-y-auto">
				{error && (
					<div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
						<AlertCircle size={16} className="text-destructive" />
						<span className="text-destructive text-sm">
							{error}
						</span>
					</div>
				)}

				{loading && books.length === 0 && (
					<div className="flex items-center justify-center py-8">
						<Loader2
							size={24}
							className="animate-spin text-muted-foreground"
						/>
						<span className="ml-2 text-muted-foreground">
							Loading book files from Arweave...
						</span>
					</div>
				)}

				{isEmpty && !loading && (
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<BookOpen
							size={48}
							className="text-muted-foreground mb-4"
						/>
						<p className="text-muted-foreground">
							No book files found
						</p>
						<p className="text-sm text-muted-foreground mt-1">
							Try refreshing the page
						</p>
					</div>
				)}

				{books.length > 0 && (
					<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
						{books.map((arweaveBook) => {
							const bookItem = convertToBook(arweaveBook);
							// Format size better
							bookItem.size = formatFileSize(bookItem.size);

							return (
								<BookCard
									key={arweaveBook.id}
									item={bookItem}
									onClick={() => handleBookClick(bookItem)}
									actions={
										<>
											<AudioBook
												url={`https://arweave.net/${bookItem.id}`}
											/>
											<MintButton item={bookItem} />
										</>
									}
								/>
							);
						})}
					</div>
				)}
			</div>

			{/* Book Modal */}
			<BookModal
				url={modalBookUrl}
				isOpen={isModalOpen}
				onClose={handleCloseModal}
			/>
		</div>
	);
};

export default BrowsePage;
