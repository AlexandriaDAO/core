import React, { useEffect, useState } from "react";
import { Button } from "@/lib/components/button";
import {
	Palette,
	Settings,
	TrendingUp,
	BarChart3,
	ArrowDown,
	FileAudio,
	LoaderPinwheel,
} from "lucide-react";
import { BookCard } from "@/features/bibliotheca/components/BookCard";
import { BookModal } from "@/features/bibliotheca/components/BookModal";
import { EditButton } from "@/features/bibliotheca/components/EditButton";
import { UnlistButton } from "@/features/bibliotheca/components/UnlistButton";
import { useShelfBookNFTs } from "@/features/bibliotheca/hooks/useShelfBookNFTs";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { ShelfBook } from "@/features/bibliotheca/types";

const BibliothecaShelfPage: React.FC = () => {
	const { user } = useAppSelector((state) => state.auth);
	const {
		books,
		loading,
		loadingMore,
		error,
		pagination,
		refreshShelfBookNFTs,
	} = useShelfBookNFTs();
	const [modalBookUrl, setModalBookUrl] = useState<string>("");
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Fetch user's listed book NFTs on component mount
	useEffect(() => {
		if (user?.principal) {
			refreshShelfBookNFTs(user.principal, 1, 8, false); // First page, not append mode
		}
	}, [user?.principal]);

	// Load More handler
	const handleLoadMore = () => {
		if (
			user?.principal &&
			!loadingMore &&
			pagination.page < pagination.totalPages
		) {
			refreshShelfBookNFTs(user.principal, pagination.page + 1, 8, true); // Next page, append mode
		}
	};

	// Modal handlers
	const handleBookClick = (book: ShelfBook) => {
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
							<Palette size={20} className="text-primary" />
							<h3 className="font-semibold">Creator Studio</h3>
						</div>
						<p className="text-sm text-muted-foreground">
							Manage your listed book NFTs and marketplace
							presence.
						</p>
						<div className="space-y-2 text-xs text-muted-foreground">
							<div className="flex items-center gap-2">
								<TrendingUp size={12} />
								<span>Track sales</span>
							</div>
							<div className="flex items-center gap-2">
								<Settings size={12} />
								<span>Edit listings</span>
							</div>
							<div className="flex items-center gap-2">
								<BarChart3 size={12} />
								<span>View analytics</span>
							</div>
						</div>
					</div>
				</div>

				<div className="w-full bg-card rounded-lg border p-5">
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<FileAudio size={20} className="text-primary" />
							<h3 className="font-semibold">Manage Listings</h3>
						</div>
						<p className="text-sm text-muted-foreground">
							Edit metadata, pricing, and availability of your
							book NFTs.
						</p>
						<div className="space-y-2">
							<div className="text-xs text-muted-foreground">
								<p className="font-medium text-foreground mb-1">
									Available actions:
								</p>
								<ul className="space-y-1">
									<li>• Edit titles and descriptions</li>
									<li>• Update pricing</li>
									<li>• Remove from marketplace</li>
								</ul>
							</div>
						</div>
						<div className="pt-2 border-t">
							<p className="text-xs text-muted-foreground">
								<span className="font-medium">
									{books.length}
								</span>{" "}
								of{" "}
								<span className="font-medium">
									{pagination.totalCount}
								</span>{" "}
								listings shown
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
							<LoaderPinwheel
								size={16}
								className="animate-spin"
							/>
						) : (
							<ArrowDown size={16} />
						)}
						{loadingMore ? "Loading..." : "Load More"}
					</Button>
				)}
			</div>

			{/* Book Grid */}
			<div className="col-span-4 overflow-y-auto">
				{loading ? (
					<div className="flex items-center justify-center py-12">
						<div className="text-center">
							<LoaderPinwheel className="w-8 h-8 animate-spin mx-auto mb-4" />
							<p className="text-muted-foreground">
								Loading your listed book NFTs...
							</p>
						</div>
					</div>
				) : error ? (
					<div className="flex items-center justify-center py-12">
						<div className="text-center">
							<p className="text-destructive font-medium">
								Error loading listed book NFTs
							</p>
							<p className="text-muted-foreground text-sm mt-1">
								{error}
							</p>
							<Button
								onClick={() =>
									user?.principal &&
									refreshShelfBookNFTs(
										user.principal,
										1,
										8,
										false
									)
								}
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
							<Palette className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
							<h3 className="text-lg font-medium mb-2">
								No Active Listings
							</h3>
							<p className="text-muted-foreground">
								You don't have any book NFTs listed for sale
								yet.
							</p>
						</div>
					</div>
				) : (
					<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
						{books.map((item) => (
							<BookCard
								key={item.id}
								item={item}
								price={item.price}
								onClick={() => handleBookClick(item)}
								actions={
									<>
										<EditButton
											item={item}
											currentPrice={item.price.replace(
												" ICP",
												""
											)}
											tokenId={item.token_id}
										/>
										<UnlistButton
											item={item}
											tokenId={item.token_id}
										/>
									</>
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

export default BibliothecaShelfPage;
