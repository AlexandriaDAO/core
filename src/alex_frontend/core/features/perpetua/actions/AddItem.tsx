import React, { useState, useMemo } from "react";
import { Plus, Loader2, AlertCircle, Search } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { Textarea } from "@/lib/components/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/lib/components/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/lib/components/tabs";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/lib/components/dialog";
import { useAddItem } from "../hooks/useMutations";
import { useMyShelves } from "../hooks/useShelves";
import { useShelvesByTag } from "../hooks/useTags";
import { useShelf } from "../hooks/useShelf";

interface AddItemProps {
	shelfId: string;
	existingShelfIds: string[];
}

type ShelfMode = "mine" | "tag" | "id";

export default function AddItem({ shelfId, existingShelfIds }: AddItemProps) {
	const [open, setOpen] = useState(false);
	const [tab, setTab] = useState("markdown");
	const [markdown, setMarkdown] = useState("");
	const [nftTokenId, setNftTokenId] = useState("");
	const [selectedShelfId, setSelectedShelfId] = useState("");
	const [error, setError] = useState<string | null>(null);
	const addItem = useAddItem();
	const { data: myShelves } = useMyShelves();

	// Shelf sub-mode state
	const [shelfMode, setShelfMode] = useState<ShelfMode>("mine");
	const [tagSearch, setTagSearch] = useState("");
	const [searchedTag, setSearchedTag] = useState<string | null>(null);
	const [shelfIdInput, setShelfIdInput] = useState("");

	const availableShelves = myShelves?.filter(
		(s) => s.shelfId !== shelfId && !existingShelfIds.includes(s.shelfId)
	) ?? [];

	// By Tag: fetch shelves for searched tag
	const { data: tagShelves, isLoading: tagShelvesLoading } = useShelvesByTag(searchedTag);
	const tagShelfResults = useMemo(() => {
		if (!tagShelves?.pages) return [];
		return tagShelves.pages
			.flatMap((p) => p.shelves)
			.filter((s) => s.shelfId !== shelfId && !existingShelfIds.includes(s.shelfId));
	}, [tagShelves, shelfId, existingShelfIds]);

	// By ID: validate the entered shelf ID exists
	const { data: lookedUpShelf, isLoading: lookupLoading, error: lookupError } = useShelf(
		shelfMode === "id" && shelfIdInput.trim().length > 0 ? shelfIdInput.trim() : undefined
	);
	const idShelfValid = !!lookedUpShelf && lookedUpShelf.shelfId !== shelfId && !existingShelfIds.includes(lookedUpShelf.shelfId);

	const canSubmit = !addItem.isPending && (
		(tab === "markdown" && markdown.trim().length > 0) ||
		(tab === "nft" && nftTokenId.trim().length > 0) ||
		(tab === "shelf" && selectedShelfId.length > 0)
	);

	const handleSubmit = async () => {
		if (!canSubmit) return;
		setError(null);

		let content;
		if (tab === "markdown") content = { Markdown: markdown.trim() };
		else if (tab === "nft") content = { Nft: nftTokenId.trim() };
		else content = { Shelf: selectedShelfId };

		try {
			await addItem.mutateAsync({ shelfId, content });
			setMarkdown("");
			setNftTokenId("");
			setSelectedShelfId("");
			setOpen(false);
		} catch (err: any) {
			setError(err?.message || "Failed to add item.");
		}
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setError(null);
			setMarkdown("");
			setNftTokenId("");
			setSelectedShelfId("");
			setTab("markdown");
			setShelfMode("mine");
			setTagSearch("");
			setSearchedTag(null);
			setShelfIdInput("");
		}
		setOpen(open);
	};

	const handleTagSearch = () => {
		if (tagSearch.trim()) {
			setSearchedTag(tagSearch.trim());
			setSelectedShelfId("");
		}
	};

	const handleShelfModeChange = (mode: ShelfMode) => {
		setShelfMode(mode);
		setSelectedShelfId("");
		setSearchedTag(null);
		setTagSearch("");
		setShelfIdInput("");
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<Button variant="ghost" scale="sm" onClick={() => setOpen(true)} className="h-9 px-2 text-sm text-muted-foreground dark:text-gray-400">
				<Plus className="h-4 w-4 mr-1" />
				Add
			</Button>

			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Plus className="h-5 w-5" />
						Add Item
					</DialogTitle>
					<DialogDescription>Add content to this shelf.</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-4 py-4">
					{error && (
						<div className="flex items-center gap-2 rounded-md bg-destructive/10 dark:bg-red-900/30 border border-destructive/20 dark:border-red-800/50 px-3 py-2 text-sm text-destructive dark:text-red-400">
							<AlertCircle className="h-4 w-4 shrink-0" />
							{error}
						</div>
					)}

					<Tabs value={tab} onValueChange={setTab}>
						<TabsList className="w-full dark:bg-gray-800">
							<TabsTrigger value="markdown" className="flex-1 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-gray-100 dark:text-gray-400">Markdown</TabsTrigger>
							<TabsTrigger value="nft" className="flex-1 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-gray-100 dark:text-gray-400">NFT</TabsTrigger>
							<TabsTrigger value="shelf" className="flex-1 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-gray-100 dark:text-gray-400">Shelf</TabsTrigger>
						</TabsList>

						<TabsContent value="markdown" className="mt-3 space-y-1">
							<Textarea
								value={markdown}
								onChange={(e) => setMarkdown(e.target.value.slice(0, 1000))}
								placeholder="Write markdown content..."
								className="resize-none bg-white text-black border-gray-400 dark:bg-gray-800 dark:text-foreground dark:border-gray-600 font-roboto-condensed font-medium focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-gray-700"
								rows={4}
							/>
							<span className="text-sm text-muted-foreground dark:text-gray-400 text-right block">{markdown.length}/1000</span>
						</TabsContent>

						<TabsContent value="nft" className="mt-3 space-y-2">
							<Input
								type="text"
								value={nftTokenId}
								onChange={(e) => setNftTokenId(e.target.value)}
								placeholder="Enter NFT token ID"
								scale="sm"
								rounded="md"
							/>
							<p className="text-sm text-muted-foreground dark:text-gray-400">
								Find NFTs in Alexandrian, Permasearch, or Emporium.
							</p>
						</TabsContent>

						<TabsContent value="shelf" className="mt-3 space-y-3">
							{/* Shelf sub-mode selector */}
							<div className="flex gap-1">
								{(["mine", "tag", "id"] as const).map((mode) => (
									<button
										key={mode}
										onClick={() => handleShelfModeChange(mode)}
										className={`px-3 py-1 text-xs rounded-full border transition-colors ${
											shelfMode === mode
												? "bg-foreground text-background border-foreground"
												: "bg-transparent text-muted-foreground border-gray-300 dark:border-gray-600 hover:border-foreground"
										}`}
									>
										{mode === "mine" ? "My Shelves" : mode === "tag" ? "By Tag" : "By ID"}
									</button>
								))}
							</div>

							{/* My Shelves mode */}
							{shelfMode === "mine" && (
								availableShelves.length === 0 ? (
									<p className="text-sm text-muted-foreground dark:text-gray-400">No available shelves to add.</p>
								) : (
									<Select value={selectedShelfId} onValueChange={setSelectedShelfId}>
										<SelectTrigger>
											<SelectValue placeholder="Select a shelf..." />
										</SelectTrigger>
										<SelectContent>
											{availableShelves.map((s) => (
												<SelectItem key={s.shelfId} value={s.shelfId}>
													{s.title}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)
							)}

							{/* By Tag mode */}
							{shelfMode === "tag" && (
								<div className="space-y-2">
									<div className="flex gap-2">
										<Input
											type="text"
											value={tagSearch}
											onChange={(e) => setTagSearch(e.target.value)}
											onKeyDown={(e) => e.key === "Enter" && handleTagSearch()}
											placeholder="Enter a tag name..."
											scale="sm"
											rounded="md"
											className="flex-1"
										/>
										<Button
											variant="secondary"
											scale="sm"
											onClick={handleTagSearch}
											disabled={!tagSearch.trim()}
											className="shrink-0"
										>
											<Search className="h-4 w-4" />
										</Button>
									</div>

									{searchedTag && (
										tagShelvesLoading ? (
											<div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-gray-400 py-2">
												<Loader2 className="h-4 w-4 animate-spin" />
												Searching shelves tagged "{searchedTag}"...
											</div>
										) : tagShelfResults.length === 0 ? (
											<p className="text-sm text-muted-foreground dark:text-gray-400">No shelves found with tag "{searchedTag}".</p>
										) : (
											<Select value={selectedShelfId} onValueChange={setSelectedShelfId}>
												<SelectTrigger>
													<SelectValue placeholder="Select a public shelf..." />
												</SelectTrigger>
												<SelectContent>
													{tagShelfResults.map((s) => (
														<SelectItem key={s.shelfId} value={s.shelfId}>
															{s.title}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										)
									)}
								</div>
							)}

							{/* By ID mode */}
							{shelfMode === "id" && (
								<div className="space-y-2">
									<Input
										type="text"
										value={shelfIdInput}
										onChange={(e) => {
											setShelfIdInput(e.target.value);
											setSelectedShelfId("");
										}}
										placeholder="Paste a shelf ID..."
										scale="sm"
										rounded="md"
									/>
									{shelfIdInput.trim() && (
										lookupLoading ? (
											<div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-gray-400">
												<Loader2 className="h-4 w-4 animate-spin" />
												Looking up shelf...
											</div>
										) : lookupError || !lookedUpShelf ? (
											<p className="text-sm text-destructive dark:text-red-400">Shelf not found.</p>
										) : !idShelfValid ? (
											<p className="text-sm text-muted-foreground dark:text-gray-400">This shelf is already added.</p>
										) : (
											<button
												onClick={() => setSelectedShelfId(lookedUpShelf.shelfId)}
												className={`w-full text-left px-3 py-2 rounded-md border text-sm transition-colors ${
													selectedShelfId === lookedUpShelf.shelfId
														? "border-primary bg-primary/5 dark:bg-primary/10"
														: "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
												}`}
											>
												<span className="font-medium">{lookedUpShelf.title}</span>
												<span className="text-muted-foreground dark:text-gray-400 ml-2">
													{lookedUpShelf.items.length} item{lookedUpShelf.items.length !== 1 ? "s" : ""}
												</span>
											</button>
										)
									)}
								</div>
							)}
						</TabsContent>
					</Tabs>
				</div>

				<DialogFooter>
					<Button type="button" variant="secondary" scale="sm" onClick={() => handleOpenChange(false)}>
						Cancel
					</Button>
					<Button variant="primary" scale="sm" disabled={!canSubmit} onClick={handleSubmit}>
						{addItem.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
						Add
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
