import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
	Bookmark,
	Loader2,
	Search,
	Plus,
	Tag,
	User,
	Check as CheckIcon,
	ChevronsUpDown,
	X,
} from "lucide-react";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Checkbox } from "@/lib/components/checkbox";
import { Badge } from "@/lib/components/badge";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/lib/components/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/lib/components/popover";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/lib/components/dialog";
import { cn } from "@/lib/utils";
import { useAddToShelf } from "../../hooks/useAddToShelf";
import { usePerpetua } from "@/hooks/actors";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import {
	getUserShelves,
	getUserPubliclyEditableShelves,
} from "@/apps/app/Perpetua/state/services/shelfService";
import { useTagActions } from "@/apps/app/Perpetua/features/tags/hooks/useTagActions";
import { useTagData } from "@/apps/app/Perpetua/features/tags/hooks/useTagData";
import { ShelfPublic } from "@/../../declarations/perpetua/perpetua.did";
import { Principal } from "@dfinity/principal";
import { toast } from "sonner";
import type { AlexandrianToken } from "../../types";

type SearchMode = "mySignedIn" | "publicByTag" | "publicByUser";

interface AddToShelfButtonProps {
	token: AlexandrianToken;
}

export function AddToShelfButton({ token }: AddToShelfButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedShelfIds, setSelectedShelfIds] = useState<string[]>([]);

	// Mode switching states
	const [searchMode, setSearchMode] = useState<SearchMode>("mySignedIn");

	// My shelves states
	const [myShelves, setMyShelves] = useState<ShelfPublic[]>([]);
	const [myShelvesSearchTerm, setMyShelvesSearchTerm] = useState("");
	const [loadingMyShelves, setLoadingMyShelves] = useState(false);

	// Public shelves by tag states
	const [publicTagSearchTerm, setPublicTagSearchTerm] = useState("");
	const [selectedTag, setSelectedTag] = useState<string | null>(null);
	const [publicShelvesByTag, setPublicShelvesByTag] = useState<ShelfPublic[]>(
		[]
	);
	const [loadingPublicShelvesByTag, setLoadingPublicShelvesByTag] =
		useState(false);

	// Public shelves by user states
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [userSelectorOpen, setUserSelectorOpen] = useState(false);
	const [publicShelvesByUser, setPublicShelvesByUser] = useState<
		ShelfPublic[]
	>([]);
	const [loadingPublicShelvesByUser, setLoadingPublicShelvesByUser] =
		useState(false);

	const { addToShelf, isLoading } = useAddToShelf();
	const { actor: perpetuaActor } = usePerpetua();
	const { user } = useAppSelector((state) => state.auth);
	const { users } = useAppSelector((state) => state.alexandrian);
	const { fetchTagsWithPrefix } = useTagActions();
	const { tagSearchResults, isTagSearchLoading, popularTags } = useTagData();

	// Load my shelves when dialog opens
	useEffect(() => {
		if (isOpen && perpetuaActor && user && searchMode === "mySignedIn") {
			loadMyShelves();
		}
	}, [isOpen, perpetuaActor, user, searchMode]);

	const loadMyShelves = async () => {
		if (!perpetuaActor || !user) return;

		setLoadingMyShelves(true);
		try {
			const result = await getUserShelves(perpetuaActor, user.principal, {
				offset: 0,
				limit: 50,
			});

			if ("Ok" in result) {
				setMyShelves(result.Ok.items);
			} else {
				toast.error("Failed to load shelves");
			}
		} catch (error) {
			console.error("Error loading shelves:", error);
			toast.error("Failed to load shelves");
		} finally {
			setLoadingMyShelves(false);
		}
	};

	const searchPublicShelvesByTag = useCallback(
		async (tag: string) => {
			if (!perpetuaActor || !tag.trim()) return;

			setLoadingPublicShelvesByTag(true);
			setPublicShelvesByTag([]);

			try {
				// Implementation based on existing ShelfSelectionDialog pattern
				const result =
					await perpetuaActor.get_public_shelves_by_tag(tag);

				if ("Ok" in result) {
					setPublicShelvesByTag(result.Ok as ShelfPublic[]);
					setSelectedTag(tag);
				} else {
					toast.error("Failed to search shelves by tag");
				}
			} catch (error) {
				console.error("Error searching shelves by tag:", error);
				toast.error("Failed to search shelves by tag");
			} finally {
				setLoadingPublicShelvesByTag(false);
			}
		},
		[perpetuaActor]
	);

	const searchPublicShelvesByUser = useCallback(
		async (userId: string) => {
			if (!perpetuaActor || !userId.trim()) return;

			setLoadingPublicShelvesByUser(true);
			setPublicShelvesByUser([]);

			try {
				const principal = Principal.fromText(userId);
				const result = await getUserPubliclyEditableShelves(
					perpetuaActor,
					principal,
					{
						offset: 0,
						limit: 50,
					}
				);

				if ("Ok" in result) {
					setPublicShelvesByUser(result.Ok.items);
					// Remove toast notifications as empty state is shown in dialog
				} else {
					console.error("Failed to load user's public shelves");
				}
			} catch (error) {
				console.error("Error loading user's public shelves:", error);
			} finally {
				setLoadingPublicShelvesByUser(false);
			}
		},
		[perpetuaActor]
	);

	// Automatically search when user is selected
	useEffect(() => {
		if (selectedUserId && searchMode === "publicByUser") {
			searchPublicShelvesByUser(selectedUserId);
		}
	}, [selectedUserId, searchMode, searchPublicShelvesByUser]);

	// Computed properties for current display state
	const currentShelves = useMemo(() => {
		if (searchMode === "mySignedIn") {
			return myShelves.filter((shelf) =>
				shelf.title
					.toLowerCase()
					.includes(myShelvesSearchTerm.toLowerCase())
			);
		} else if (searchMode === "publicByTag" && selectedTag) {
			return publicShelvesByTag;
		} else if (searchMode === "publicByUser" && selectedUserId) {
			return publicShelvesByUser;
		}
		return [];
	}, [
		searchMode,
		myShelves,
		myShelvesSearchTerm,
		publicShelvesByTag,
		selectedTag,
		publicShelvesByUser,
		selectedUserId,
	]);

	// Helper functions for user selector
	const getUserDisplayName = (userId: string | null) => {
		if (!userId) return "Select User";
		const foundUser = users.find((u) => u.principal === userId);
		return foundUser ? foundUser.username : userId.slice(0, 8) + "...";
	};

	const getAvailableUsers = () => {
		return users.filter((user) => user.hasNfts || user.hasSbts);
	};

	const isCurrentlyLoading = useMemo(() => {
		if (searchMode === "mySignedIn") return loadingMyShelves;
		if (searchMode === "publicByTag") return loadingPublicShelvesByTag;
		if (searchMode === "publicByUser") return loadingPublicShelvesByUser;
		return false;
	}, [
		searchMode,
		loadingMyShelves,
		loadingPublicShelvesByTag,
		loadingPublicShelvesByUser,
	]);

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		setIsOpen(true);
	};

	const handleShelfToggle = (shelfId: string) => {
		setSelectedShelfIds((prev) =>
			prev.includes(shelfId)
				? prev.filter((id) => id !== shelfId)
				: [...prev, shelfId]
		);
	};

	const handleAddToShelves = async () => {
		if (selectedShelfIds.length === 0) {
			toast.error("Please select at least one shelf");
			return;
		}

		try {
			await addToShelf(token, selectedShelfIds);
			setIsOpen(false);
			setSelectedShelfIds([]);
			toast.success("Added to shelf successfully!");
		} catch (error) {
			console.error("Failed to add to shelf:", error);
			toast.error("Failed to add to shelf");
		}
	};

	return (
		<>
			<Button
				variant="outline"
				scale="sm"
				onClick={handleClick}
				disabled={isLoading}
				className="flex items-center gap-2"
			>
				{isLoading ? (
					<>
						<Loader2 className="h-4 w-4 animate-spin" />
						<span className="text-sm">Adding...</span>
					</>
				) : (
					<>
						<Bookmark className="h-4 w-4" />
						<span className="text-sm">Add to Shelf</span>
					</>
				)}
			</Button>

			<Dialog
				open={isOpen}
				onOpenChange={(open) => {
					setIsOpen(open);
					if (!open) {
						// Reset all states when dialog closes
						setSelectedShelfIds([]);
						setSearchMode("mySignedIn");
						setMyShelvesSearchTerm("");
						setPublicTagSearchTerm("");
						setSelectedTag(null);
						setSelectedUserId(null);
						setUserSelectorOpen(false);
						setPublicShelvesByTag([]);
						setPublicShelvesByUser([]);
					}
				}}
			>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Add to Shelf</DialogTitle>
						<DialogDescription>
							Add this {token.collection.toLowerCase()} to your
							own shelves or discover publicly editable shelves by
							tag or user.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						{/* Mode switching tabs */}
						<div className="flex gap-1">
							<Button
								variant={
									searchMode === "mySignedIn"
										? "primary"
										: "outline"
								}
								onClick={() => setSearchMode("mySignedIn")}
								className="flex-1 text-sm"
								disabled={
									isLoading || searchMode === "mySignedIn"
								}
							>
								My Shelves
							</Button>
							<Button
								variant={
									searchMode === "publicByTag"
										? "primary"
										: "outline"
								}
								onClick={() => setSearchMode("publicByTag")}
								className="flex-1 text-sm"
								disabled={
									isLoading || searchMode === "publicByTag"
								}
							>
								<Tag className="h-3 w-3 mr-1" />
								By Tags
							</Button>
							<Button
								variant={
									searchMode === "publicByUser"
										? "primary"
										: "outline"
								}
								onClick={() => setSearchMode("publicByUser")}
								className="flex-1 text-sm"
								disabled={
									isLoading || searchMode === "publicByUser"
								}
							>
								<User className="h-3 w-3 mr-1" />
								By User
							</Button>
						</div>

						{/* My Shelves Mode */}
						{searchMode === "mySignedIn" && (
							<>
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="Search your shelves..."
										value={myShelvesSearchTerm}
										onChange={(e) =>
											setMyShelvesSearchTerm(
												e.target.value
											)
										}
										className="pl-10"
									/>
								</div>
							</>
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
												setPublicTagSearchTerm(
													newValue
												);

												// Clear search results when input becomes empty
												if (newValue === "") {
													setSelectedTag(null);
													setPublicShelvesByTag([]);
												}
											}}
											className="pl-10 pr-20"
											onKeyPress={(e) => {
												if (
													e.key === "Enter" &&
													publicTagSearchTerm.trim()
												) {
													searchPublicShelvesByTag(
														publicTagSearchTerm.trim()
													);
												}
											}}
										/>
										<div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
											{publicTagSearchTerm && (
												<button
													onClick={() => {
														setPublicTagSearchTerm(
															""
														);
														setSelectedTag(null);
														setPublicShelvesByTag(
															[]
														);
													}}
												>
													<X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
												</button>
											)}
											{publicTagSearchTerm.trim() && (
												<button
													onClick={() =>
														searchPublicShelvesByTag(
															publicTagSearchTerm.trim()
														)
													}
													disabled={
														loadingPublicShelvesByTag
													}
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
								{!selectedTag &&
									popularTags &&
									popularTags.length > 0 && (
										<div className="space-y-2">
											<Label className="text-xs text-muted-foreground">
												Popular Tags
											</Label>
											<div className="flex flex-wrap gap-1">
												{popularTags
													.slice(0, 6)
													.map((tag) => (
														<Badge
															key={tag}
															variant="secondary"
															className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs"
															onClick={() => {
																setPublicTagSearchTerm(
																	tag
																);
																searchPublicShelvesByTag(
																	tag
																);
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
							<div className="space-y-2">
								<div className="relative">
									<User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Popover
										open={userSelectorOpen}
										onOpenChange={setUserSelectorOpen}
									>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={userSelectorOpen}
												className="w-full justify-start pl-10 pr-10 border border-input dark:border-border"
											>
												{getUserDisplayName(
													selectedUserId
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent
											className="w-[--radix-popover-trigger-width] p-0"
											align="start"
										>
											<Command>
												<CommandInput placeholder="Search users..." />
												<CommandList>
													<CommandEmpty>
														No users found.
													</CommandEmpty>
													<CommandGroup>
														{getAvailableUsers().map(
															(user) => (
																<CommandItem
																	key={
																		user.principal
																	}
																	onSelect={() => {
																		setSelectedUserId(
																			user.principal
																		);
																		setUserSelectorOpen(
																			false
																		);
																	}}
																>
																	<CheckIcon
																		className={cn(
																			"mr-2 h-4 w-4",
																			selectedUserId ===
																				user.principal
																				? "opacity-100"
																				: "opacity-0"
																		)}
																	/>
																	<div className="flex flex-col">
																		<span className="font-medium">
																			{
																				user.username
																			}
																		</span>
																		<span className="text-xs text-muted-foreground">
																			{
																				user.principal
																			}
																		</span>
																	</div>
																</CommandItem>
															)
														)}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
									<ChevronsUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 shrink-0 opacity-50" />
								</div>
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
											: searchMode === "publicByTag" &&
												  !selectedTag
												? "Search for a tag or select from popular tags to discover public shelves."
												: searchMode ===
															"publicByUser" &&
													  !selectedUserId
													? "Select a user to see their publicly editable shelves."
													: selectedTag
														? `No public shelves found with the tag "${selectedTag}".`
														: selectedUserId
															? `${getUserDisplayName(selectedUserId)} has no publicly editable shelves.`
															: "No shelves found."}
									</p>
								</div>
							) : (
								currentShelves.map((shelf) => (
									<div
										key={shelf.shelf_id}
										className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-accent"
									>
										<Checkbox
											id={shelf.shelf_id}
											checked={selectedShelfIds.includes(
												shelf.shelf_id
											)}
											onCheckedChange={() =>
												handleShelfToggle(
													shelf.shelf_id
												)
											}
										/>
										<Label
											htmlFor={shelf.shelf_id}
											className="flex-1 cursor-pointer"
										>
											<div>
												<p className="font-medium text-sm">
													{shelf.title}
												</p>
												{shelf.description &&
													shelf.description.length >
														0 && (
														<p className="text-xs text-muted-foreground">
															{
																shelf
																	.description[0]
															}
														</p>
													)}
												<p className="text-xs text-muted-foreground">
													by{" "}
													{shelf.owner
														.toString()
														.slice(0, 8)}
													...
												</p>
											</div>
										</Label>
									</div>
								))
							)}
						</div>

						{/* Selected count */}
						{selectedShelfIds.length > 0 && (
							<p className="text-sm text-muted-foreground">
								{selectedShelfIds.length} shelf
								{selectedShelfIds.length !== 1 ? "s" : ""}{" "}
								selected
							</p>
						)}
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsOpen(false)}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button
							onClick={handleAddToShelves}
							disabled={
								isLoading || selectedShelfIds.length === 0
							}
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
