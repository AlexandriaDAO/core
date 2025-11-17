import React, { useEffect, useState } from "react";
import { Button } from "@/lib/components/button";
import { Store, TrendingUp, Search, Filter, ArrowDown, FileAudio, LoaderPinwheel } from "lucide-react";
import { BookCard } from "@/features/bibliotheca/components/BookCard";
import { BookModal } from "@/features/bibliotheca/components/BookModal";
import { BuyButton } from "@/features/bibliotheca/components/BuyButton";
import { useMarketBookNFTs } from "@/features/bibliotheca/hooks/useMarketBookNFTs";
import { MarketBook } from "@/features/bibliotheca/types";

const BibliothecaMarketPage: React.FC = () => {
	const { books, loading, loadingMore, error, pagination, refreshMarketBookNFTs } = useMarketBookNFTs();
	const [modalBookUrl, setModalBookUrl] = useState<string>("");
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Fetch market book NFTs on component mount
	useEffect(() => {
		refreshMarketBookNFTs(1, 8, false); // First page, not append mode
	}, []);

	// Load More handler
	const handleLoadMore = () => {
		if (!loadingMore && pagination.page < pagination.totalPages) {
			refreshMarketBookNFTs(pagination.page + 1, 8, true); // Next page, append mode
		}
	};

	// Modal handlers
	const handleBookClick = (book: MarketBook) => {
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
						<div className="flex items-center gap-2">
							<Store size={20} className="text-primary" />
							<h3 className="font-semibold">Marketplace</h3>
						</div>
						<p className="text-sm text-muted-foreground">
							Discover and purchase book NFTs from creators worldwide.
						</p>
						<div className="space-y-2 text-xs text-muted-foreground">
							<div className="flex items-center gap-2">
								<TrendingUp size={12} />
								<span>Trending content</span>
							</div>
							<div className="flex items-center gap-2">
								<Search size={12} />
								<span>Search by genre</span>
							</div>
							<div className="flex items-center gap-2">
								<Filter size={12} />
								<span>Filter by price</span>
							</div>
						</div>
					</div>
				</div>

				<div className="w-full bg-card rounded-lg border p-5">
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<FileAudio size={20} className="text-primary" />
							<h3 className="font-semibold">Buy & Own</h3>
						</div>
						<p className="text-sm text-muted-foreground">
							Purchase book NFTs with ALEX or LBRY tokens and own them forever.
						</p>
						<div className="space-y-2">
							<div className="text-xs text-muted-foreground">
								<p className="font-medium text-foreground mb-1">How it works:</p>
								<ul className="space-y-1">
									<li>• Preview before buying</li>
									<li>• Secure blockchain purchase</li>
									<li>• Instant ownership transfer</li>
								</ul>
							</div>
						</div>
						<div className="pt-2 border-t">
							<p className="text-xs text-muted-foreground">
								<span className="font-medium">{books.length}</span> of <span className="font-medium">{pagination.totalCount}</span> items shown
							</p>
						</div>
					</div>
				</div>

				{/* Load More */}
				{pagination.page < pagination.totalPages && (
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
							<p className="text-muted-foreground">Loading marketplace book NFTs...</p>
						</div>
					</div>
				) : error ? (
					<div className="flex items-center justify-center py-12">
						<div className="text-center">
							<p className="text-destructive font-medium">Error loading marketplace</p>
							<p className="text-muted-foreground text-sm mt-1">{error}</p>
							<Button 
								onClick={() => refreshMarketBookNFTs(1, 8, false)}
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
							<Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
							<h3 className="text-lg font-medium mb-2">No Items for Sale</h3>
							<p className="text-muted-foreground">There are currently no book NFTs listed in the marketplace.</p>
						</div>
					</div>
				) : (
					<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
						{books.map((book) => (
							<BookCard 
								key={book.id} 
								item={book}
								price={book.price}
								owner={book.owner}
								onClick={() => handleBookClick(book)}
								actions={
									<BuyButton 
										item={book} 
										price={book.price.replace(' ICP', '')} 
										tokenId={book.token_id} 
									/>
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

export default BibliothecaMarketPage;