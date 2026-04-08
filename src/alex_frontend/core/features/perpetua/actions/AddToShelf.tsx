import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
	CirclePlus,
	Loader2,
	Search,
	Tag,
	User,
	X,
	LoaderPinwheel,
	RotateCw,
	Layers,
} from "lucide-react";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Checkbox } from "@/lib/components/checkbox";
import { Badge } from "@/lib/components/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/lib/components/tooltip";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/lib/components/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import usePerpetua from "@/hooks/actors/usePerpetua";
import { Principal } from "@dfinity/principal";
import { useMyShelves } from "../hooks/useShelves";
import { usePopularTags } from "../hooks/useTags";
import { useAddItem, useCreateShelf } from "../hooks/useMutations";
import { normalizeShelf } from "../utils";
import type { Shelf } from "../types";
import type { ShelfPublic } from "../../../../../declarations/perpetua/perpetua.did";
import { AddShelfButton } from "@/components/AddShelfButton";

type SearchMode = "mySignedIn" | "publicByTag" | "publicByUser";

interface AddToShelfProps {
	shelfId: string;
	className?: string;
}

export default function AddToShelf({ shelfId, className }: AddToShelfProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedShelfIds, setSelectedShelfIds] = useState<string[]>([]);

	// Mode switching
	const [searchMode, setSearchMode] = useState<SearchMode>("mySignedIn");

	// My shelves
	const { data: myShelves, refetch: refetchMyShelves, isRefetching: isRefetchingMyShelves } = useMyShelves();
	const [myShelvesSearchTerm, setMyShelvesSearchTerm] = useState("");

	// Public by tag
	const [publicTagSearchTerm, setPublicTagSearchTerm] = useState("");
	const [selectedTag, setSelectedTag] = useState<string | null>(null);
	const [publicShelvesByTag, setPublicShelvesByTag] = useState<Shelf[]>([]);
	const [loadingPublicShelvesByTag, setLoadingPublicShelvesByTag] = useState(false);
	const { data: popularTags } = usePopularTags();

	// Public by user
	const [userPrincipalInput, setUserPrincipalInput] = useState("");
	const [searchedUser, setSearchedUser] = useState<string | null>(null);
	const [publicShelvesByUser, setPublicShelvesByUser] = useState<Shelf[]>([]);
	const [loadingPublicShelvesByUser, setLoadingPublicShelvesByUser] = useState(false);

	const { actor } = usePerpetua();
	const addItem = useAddItem();
	const user = useAppSelector((state) => state.auth.user);

	const isLoading = addItem.isPending;

	const isCurrentlyLoading = useMemo(() => {
		if (searchMode === "mySignedIn") return isRefetchingMyShelves;
		if (searchMode === "publicByTag") return loadingPublicShelvesByTag;
		if (searchMode === "publicByUser") return loadingPublicShelvesByUser;
		return false;
	}, [searchMode, isRefetchingMyShelves, loadingPublicShelvesByTag, loadingPublicShelvesByUser]);

	// Filtered my shelves (exclude self)
	const currentShelves = useMemo(() => {
		if (searchMode === "mySignedIn") {
			const shelves = myShelves?.filter((s) => s.shelfId !== shelfId) ?? [];
			if (!myShelvesSearchTerm) return shelves;
			const term = myShelvesSearchTerm.toLowerCase();
			return shelves.filter((s) =>
				s.title.toLowerCase().includes(term) ||
				(s.description?.toLowerCase().includes(term))
			);
		}
		if (searchMode === "publicByTag" && selectedTag) return publicShelvesByTag;
		if (searchMode === "publicByUser" && searchedUser) return publicShelvesByUser;
		return [];
	}, [searchMode, myShelves, shelfId, myShelvesSearchTerm, selectedTag, publicShelvesByTag, searchedUser, publicShelvesByUser]);

	// Fetch public shelves by tag
	const searchPublicShelvesByTagFn = useCallback(async (tag: string) => {
		if (!actor || !tag.trim()) return;
		setLoadingPublicShelvesByTag(true);
		setPublicShelvesByTag([]);
		try {
			const result = await actor.get_public_shelves_by_tag(tag.trim());
			if ("Ok" in result) {
				const shelves = (result.Ok as ShelfPublic[])
					.map(normalizeShelf)
					.filter((s) => s.shelfId !== shelfId);
				setPublicShelvesByTag(shelves);
				setSelectedTag(tag.trim());
			} else {
				toast.error("Failed to search shelves by tag");
			}
		} catch {
			toast.error("Failed to search shelves by tag");
		} finally {
			setLoadingPublicShelvesByTag(false);
		}
	}, [actor, shelfId]);

	// Fetch public shelves by user
	const searchPublicShelvesByUserFn = useCallback(async (principalStr: string) => {
		if (!actor || !principalStr.trim()) return;
		setLoadingPublicShelvesByUser(true);
		setPublicShelvesByUser([]);
		try {
			const principal = Principal.fromText(principalStr.trim());
			const result = await actor.get_user_publicly_editable_shelves(principal, { offset: 0n, limit: 50n });
			if ("Ok" in result) {
				const shelves = (result.Ok as { items: ShelfPublic[] }).items
					.map(normalizeShelf)
					.filter((s) => s.shelfId !== shelfId);
				setPublicShelvesByUser(shelves);
				setSearchedUser(principalStr.trim());
			} else {
				toast.error("Failed to load user's public shelves");
			}
		} catch {
			toast.error("Invalid principal or failed to load shelves");
		} finally {
			setLoadingPublicShelvesByUser(false);
		}
	}, [actor, shelfId]);

	const handleShelfToggle = (id: string) => {
		setSelectedShelfIds((prev) =>
			prev.includes(id)
				? prev.filter((s) => s !== id)
				: [...prev, id]
		);
	};

	const handleAddToShelves = async () => {
		if (selectedShelfIds.length === 0) {
			toast.error("Please select at least one shelf");
			return;
		}
		try {
			const results = await Promise.allSettled(
				selectedShelfIds.map((targetShelfId) =>
					addItem.mutateAsync({
						shelfId: targetShelfId,
						content: { Shelf: shelfId },
					})
				)
			);
			const succeeded = results.filter((r) => r.status === "fulfilled").length;
			const failed = results.filter((r) => r.status === "rejected").length;
			if (succeeded > 0) toast.success(`Added to ${succeeded} shelf${succeeded !== 1 ? "s" : ""}`);
			if (failed > 0) toast.error(`Failed to add to ${failed} shelf${failed !== 1 ? "s" : ""}`);
			setIsOpen(false);
			setSelectedShelfIds([]);
		} catch {
			toast.error("An unexpected error occurred");
		}
	};

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		if (!user) {
			toast.error("Please log in to add items to shelves");
			return;
		}
		setIsOpen(true);
	};

	return (
		<>
			<Tooltip delayDuration={0}>
				<TooltipTrigger asChild>
					<Button
						variant="outline"
						scale="sm"
						onClick={handleClick}
						disabled={isLoading}
						className={cn("px-1 group/bookmark rounded-t-none rounded-b", className)}
					>
						{isLoading ? <LoaderPinwheel size={16} className="animate-spin" /> : <CirclePlus size={16} className="text-muted-foreground group-hover/bookmark:text-foreground dark:group-hover/bookmark:text-primary transition-colors" />}
					</Button>
				</TooltipTrigger>
				<TooltipContent side="right" sideOffset={8} portal>Add to shelf</TooltipContent>
			</Tooltip>

			<Dialog
				open={isOpen}
				onOpenChange={(open) => {
					setIsOpen(open);
					if (!open) {
						setSelectedShelfIds([]);
						setSearchMode("mySignedIn");
						setMyShelvesSearchTerm("");
						setPublicTagSearchTerm("");
						setSelectedTag(null);
						setPublicShelvesByTag([]);
						setUserPrincipalInput("");
						setSearchedUser(null);
						setPublicShelvesByUser([]);
					}
				}}
			>
				<DialogContent className="sm:max-w-lg" onClick={(e) => e.stopPropagation()}>
					<DialogHeader>
						<DialogTitle>Add to Shelf</DialogTitle>
						<DialogDescription>
							Add this item to your own shelves or discover publicly editable shelves by tag or user.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 max-w-full">
						{/* Mode switching tabs */}
						<div className="flex gap-1">
							<Button
								variant={searchMode === "mySignedIn" ? "primary" : "outline"}
								scale="sm"
								onClick={() => setSearchMode("mySignedIn")}
								className="flex-1"
								disabled={isLoading || searchMode === "mySignedIn"}
							>
								<Layers className="h-3 w-3 mr-1" />
								My Shelves
							</Button>
							<Button
								variant={searchMode === "publicByTag" ? "primary" : "outline"}
								scale="sm"
								onClick={() => setSearchMode("publicByTag")}
								className="flex-1"
								disabled={isLoading || searchMode === "publicByTag"}
							>
								<Tag className="h-3 w-3 mr-1" />
								By Tags
							</Button>
							<Button
								variant={searchMode === "publicByUser" ? "primary" : "outline"}
								scale="sm"
								onClick={() => setSearchMode("publicByUser")}
								className="flex-1"
								disabled={isLoading || searchMode === "publicByUser"}
							>
								<User className="h-3 w-3 mr-1" />
								By User
							</Button>
						</div>

						{/* My Shelves Mode */}
						{searchMode === "mySignedIn" && (
							<div className="flex items-stretch gap-2">
								<div className="flex-grow relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="Search your shelves..."
										value={myShelvesSearchTerm}
										onChange={(e) => setMyShelvesSearchTerm(e.target.value)}
										className="pl-10"
									/>
								</div>
								<button
									type="button"
									onClick={() => refetchMyShelves()}
									disabled={isCurrentlyLoading}
									className="px-3 rounded border border-gray-400 bg-white text-black dark:bg-gray-800 dark:border-gray-600 dark:text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
								>
									<RotateCw className={`h-4 w-4 ${isCurrentlyLoading ? "animate-spin" : ""}`} />
								</button>
							</div>
						)}

						{/* Public By Tags Mode */}
						{searchMode === "publicByTag" && (
							<div className="space-y-3">
								<div className="space-y-2">
									<div className="relative">
										<Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											placeholder="Enter tag name (e.g., art, books, music)..."
											value={publicTagSearchTerm}
											onChange={(e) => {
												const newValue = e.target.value;
												setPublicTagSearchTerm(newValue);
												if (newValue === "") {
													setSelectedTag(null);
													setPublicShelvesByTag([]);
												}
											}}
											className="pl-10 pr-20"
											onKeyDown={(e) => {
												if (e.key === "Enter" && publicTagSearchTerm.trim()) {
													searchPublicShelvesByTagFn(publicTagSearchTerm.trim());
												}
											}}
										/>
										<div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
											{publicTagSearchTerm && (
												<button
													onClick={() => {
														setPublicTagSearchTerm("");
														setSelectedTag(null);
														setPublicShelvesByTag([]);
													}}
												>
													<X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
												</button>
											)}
											{publicTagSearchTerm.trim() && (
												<button
													onClick={() => searchPublicShelvesByTagFn(publicTagSearchTerm.trim())}
													disabled={loadingPublicShelvesByTag}
												>
													{loadingPublicShelvesByTag ? (
														<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
													) : (
														<Search className="h-4 w-4 text-muted-foreground hover:text-foreground" />
													)}
												</button>
											)}
										</div>
									</div>
								</div>

								{/* Popular tags */}
								{!selectedTag && popularTags && popularTags.length > 0 && (
									<div className="space-y-2">
										<Label className="text-xs text-muted-foreground">
											Popular Tags
										</Label>
										<div className="flex flex-wrap gap-2">
											{popularTags.slice(0, 6).map((tag) => (
												<Badge
													key={tag}
													variant="outline"
													className="text-xs py-0.5 px-2.5 cursor-pointer transition-colors bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
													onClick={() => {
														setPublicTagSearchTerm(tag);
														searchPublicShelvesByTagFn(tag);
													}}
												>
													{tag}
												</Badge>
											))}
										</div>
									</div>
								)}
							</div>
						)}

						{/* Public By User Mode */}
						{searchMode === "publicByUser" && (
							<div className="flex items-stretch gap-2">
								<div className="flex-grow relative">
									<User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="Enter user principal ID..."
										value={userPrincipalInput}
										onChange={(e) => setUserPrincipalInput(e.target.value)}
										onKeyDown={(e) => { if (e.key === "Enter") searchPublicShelvesByUserFn(userPrincipalInput); }}
										className="pl-10"
										disabled={isLoading}
									/>
								</div>
								<button
									type="button"
									onClick={() => searchPublicShelvesByUserFn(userPrincipalInput)}
									disabled={!userPrincipalInput.trim() || loadingPublicShelvesByUser}
									className="px-3 rounded border border-gray-400 bg-white text-black dark:bg-gray-800 dark:border-gray-600 dark:text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
								>
									{loadingPublicShelvesByUser ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Search className="h-4 w-4" />
									)}
								</button>
							</div>
						)}

						{/* Shelves list display */}
						<div className="max-h-60 overflow-y-auto space-y-2">
							{isCurrentlyLoading ? (
								<div className="flex items-center justify-center py-8">
									<Loader2 className="h-6 w-6 animate-spin" />
									<span className="ml-2 text-sm text-muted-foreground">
										Loading shelves...
									</span>
								</div>
							) : currentShelves.length === 0 ? (
								<div className="text-center py-8">
									<p className="text-sm text-muted-foreground">
										{searchMode === "mySignedIn"
											? myShelvesSearchTerm
												? "No shelves match your search."
												: "You have no shelves yet."
											: searchMode === "publicByTag" && !selectedTag
												? "Search for a tag or select from popular tags to discover public shelves."
												: searchMode === "publicByUser" && !searchedUser
													? "Enter a user principal to see their publicly editable shelves."
													: selectedTag
														? `No public shelves found with the tag "${selectedTag}".`
														: searchedUser
															? "This user has no publicly editable shelves."
															: "No shelves found."}
									</p>
								</div>
							) : (
								currentShelves.map((shelf) => (
									<div
										key={shelf.shelfId}
										className="flex items-start space-x-2 p-2 border rounded-lg hover:bg-accent"
									>
										<Checkbox
											id={shelf.shelfId}
											checked={selectedShelfIds.includes(shelf.shelfId)}
											onCheckedChange={() => handleShelfToggle(shelf.shelfId)}
											className="mt-0.5"
										/>
										<Label
											htmlFor={shelf.shelfId}
											className="flex-grow max-w-full flex-col gap-0 items-start cursor-pointer"
										>
											<span className="font-medium text-sm">
												{shelf.title}
											</span>
											{shelf.description && (
												<span className="text-xs text-muted-foreground">{shelf.description}</span>
											)}
										</Label>
									</div>
								))
							)}
						</div>

						{/* Selected count */}
						{selectedShelfIds.length > 0 && (
							<p className="text-sm text-muted-foreground">
								{selectedShelfIds.length} shelf{selectedShelfIds.length !== 1 ? "s" : ""}{" "}
								selected
							</p>
						)}
					</div>

					<DialogFooter>
						{searchMode === "mySignedIn" && <AddShelfButton />}
						<Button
							onClick={handleAddToShelves}
							disabled={isLoading || selectedShelfIds.length === 0}
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Adding...
								</>
							) : (
								`Add to ${selectedShelfIds.length > 1 ? `${selectedShelfIds.length} Shelves` : "Shelf"}`
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
