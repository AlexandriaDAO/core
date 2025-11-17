import React, { useEffect, useState } from "react";
import { Button } from "@/lib/components/button";
import { Archive, User, FileAudio, Download, ArrowDown, LoaderPinwheel } from "lucide-react";
import { BookCard } from "@/features/bibliotheca/components/BookCard";
import { BookModal } from "@/features/bibliotheca/components/BookModal";
import { SellButton } from "@/features/bibliotheca/components/SellButton";
import { useUserBookNFTs } from "@/features/bibliotheca/hooks/useUserBookNFTs";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Book } from "@/features/bibliotheca/types";

const BibliothecaLibraryPage: React.FC = () => {
	const { user } = useAppSelector((state) => state.auth);
	const { books, loading, loadingMore, error, pagination, refreshBookNFTs } = useUserBookNFTs();
	const [modalBookUrl, setModalBookUrl] = useState<string>("");
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Fetch user's book NFTs when component mounts or user changes
	useEffect(() => {
		if (user?.principal && books.length === 0 && !loading && !loadingMore) {
			console.log('[LibraryPage] Fetching user book NFTs for:', user.principal);
			refreshBookNFTs(user.principal, 1, false); // First page, not append mode
		}
	}, [user?.principal]); // Remove other dependencies to prevent loops

	// Load More handler
	const handleLoadMore = () => {
		if (user?.principal && !loadingMore && pagination.hasMore) {
			refreshBookNFTs(user.principal, pagination.page + 1, true); // Next page, append mode
		}
	};

	// Modal handlers
	const handleBookClick = (book: Book) => {
		const bookUrl = book.id.startsWith('blob:') || book.id.includes('.') ? 
			book.id : `https://arweave.net/${book.id}`;
		setModalBookUrl(bookUrl);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setModalBookUrl("");
	};

	return (
		<div className="grid grid-cols-5 min-h-full">
			{/* Left Sidebar */}
			<div className="col-span-1 flex flex-col gap-4 items-center sticky top-0 h-fit">
				<div className="w-full bg-card rounded-lg border p-5">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Archive size={20} className="text-primary" />
								<h3 className="font-semibold">Your Collection</h3>
							</div>
							<Button
								variant="ghost"
								scale="sm"
								onClick={() => user?.principal && refreshBookNFTs(user.principal, 1, false)}
								disabled={loading}
								className="text-xs h-6"
							>
								Refresh
							</Button>
						</div>
						<p className="text-sm text-muted-foreground">
							Your personal book NFT collection and uploaded content.
						</p>
						<div className="space-y-2 text-xs text-muted-foreground">
							<div className="flex items-center gap-2">
								<User size={12} />
								<span>Owned by you</span>
							</div>
							<div className="flex items-center gap-2">
								<FileAudio size={12} />
								<span>Ready to trade</span>
							</div>
							<div className="flex items-center gap-2">
								<Download size={12} />
								<span>Download anytime</span>
							</div>
						</div>
					</div>
				</div>

				<div className="w-full bg-card rounded-lg border p-5">
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<FileAudio size={20} className="text-primary" />
							<h3 className="font-semibold">Manage Content</h3>
						</div>
						<p className="text-sm text-muted-foreground">
							Download, share, or list your book NFTs for sale.
						</p>
						<div className="space-y-2">
							<div className="text-xs text-muted-foreground">
								<p className="font-medium text-foreground mb-1">Available actions:</p>
								<ul className="space-y-1">
									<li>• Download original files</li>
									<li>• Share with others</li>
									<li>• List on marketplace</li>
								</ul>
							</div>
						</div>
						<div className="pt-2 border-t">
							<p className="text-xs text-muted-foreground">
								<span className="font-medium">{books.length}</span> of <span className="font-medium">{pagination.totalCount}</span> items
							</p>
						</div>
					</div>
				</div>

				{/* Load More */}
				{pagination.hasMore && (
					<Button 
						variant="outline" 
						className="gap-2" 
						onClick={handleLoadMore}
						disabled={loadingMore}
					>
						{loadingMore ? (
							<LoaderPinwheel size={16} className="animate-spin" />
						) : (
							<ArrowDown size={16} />
						)}
						{loadingMore ? "Loading..." : "Load More"}
					</Button>
				)}
			</div>

			{/* Book Grid */}
			<div className="col-span-4 overflow-y-auto px-6">
				{loading ? (
					<div className="flex items-center justify-center py-12">
						<div className="text-center">
							<LoaderPinwheel className="w-8 h-8 animate-spin mx-auto mb-4" />
							<p className="text-muted-foreground">Loading your book NFTs...</p>
							<p className="text-xs text-muted-foreground mt-2">This may take a few moments</p>
						</div>
					</div>
				) : error ? (
					<div className="flex items-center justify-center py-12">
						<div className="text-center">
							<p className="text-destructive font-medium">Error loading NFTs</p>
							<p className="text-muted-foreground text-sm mt-1">{error}</p>
							<Button 
								onClick={() => user?.principal && refreshBookNFTs(user.principal, 1, false)}
								className="mt-4"
								variant="outline"
							>
								Try Again
							</Button>
						</div>
					</div>
				) : books.length === 0 ? (
					<div className="flex items-center justify-center py-12">
						<div className="text-center">
							<FileAudio className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
							<h3 className="text-lg font-medium mb-2">No Book NFTs Found</h3>
							<p className="text-muted-foreground">You haven't minted any book NFTs yet.</p>
						</div>
					</div>
				) : (
					<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
						{books.map((item) => (
							<BookCard 
								key={item.id} 
								item={item}
								onClick={() => handleBookClick(item)}
								actions={
									<SellButton item={item} tokenId={item.token_id} />
								}
							/>
						))}
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

export default BibliothecaLibraryPage;