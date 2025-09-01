import React, { useState } from "react";
import {
	Bookmark,
	Loader2,
	Tag,
	X,
} from "lucide-react";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Badge } from "@/lib/components/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/lib/components/dialog";
import { cn } from "@/lib/utils";
import { usePerpetua } from "@/hooks/actors";
import { toast } from "sonner";

interface AddToShelfButtonProps {
	variant?: "outline" | "primary" | "ghost";
	scale?: "sm" | "default" | "lg";
	className?: string;
	onSuccess?: () => void;
}

export function AddShelfButton({ variant = "outline", scale = "default", className = "", onSuccess }: AddToShelfButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [tags, setTags] = useState<string[]>([]);
	const [tagInput, setTagInput] = useState("");
	const { actor: perpetua } = usePerpetua();

	const addTag = () => {
		if (tagInput.trim() && !tags.includes(tagInput.trim())) {
			setTags([...tags, tagInput.trim()]);
			setTagInput("");
		}
	};

	const removeTag = (index: number) => {
		setTags(tags.filter((_, i) => i !== index));
	};

	const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			addTag();
		}
	};

	const handleCreateShelf = async () => {
		if (!perpetua || !title.trim()) return;

		setIsLoading(true);
		try {
			const result = await perpetua.store_shelf(
				title.trim(),
				description.trim() ? [description.trim()] : [],
				[],
				tags.length > 0 ? [tags] : []
			);

			if ("Ok" in result) {
				toast.success("Shelf created successfully!");
				setTitle("");
				setDescription("");
				setTags([]);
				setTagInput("");
				setIsOpen(false);
				if (onSuccess) onSuccess();
			} else {
				if (result.Err.includes("Not enough balance") || result.Err.includes("Shelves cost 50 LBRY to create")) {
					toast.error("Failed to create shelf: Not enough balance. Shelves cost 50 LBRY to create. Please add to your top-up account.");
				} else {
					toast.error(`Failed to create shelf: ${result.Err}`);
				}
			}
		} catch (error) {
			console.error('Error creating shelf:', error);
			toast.error("Failed to create shelf");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<Button
				variant={variant}
				scale={scale}
				onClick={() => setIsOpen(true)}
				disabled={isLoading}
				className={cn("px-2", className)}
			>
				<Bookmark size={18}/> Create New Shelf
			</Button>

			<Dialog
				open={isOpen}
			>
				<DialogContent
					className="sm:max-w-lg"
					closeIcon={null}
					onOpenAutoFocus={(e) => e.preventDefault()}
				>
					<DialogHeader>
						<DialogTitle>Create New Shelf</DialogTitle>
						<DialogDescription>
							Create a new shelf to organize your items. Shelves cost 50 LBRY to create.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div>
							<Label htmlFor="title">Title *</Label>
							<Input
								id="title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Enter shelf title"
								disabled={isLoading}
							/>
						</div>

						<div>
							<Label htmlFor="description">Description</Label>
							<Input
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Enter shelf description (optional)"
								disabled={isLoading}
							/>
						</div>

						<div>
							<Label>Tags</Label>
							<div className="flex items-stretch gap-2 mb-2">
								<Input
									value={tagInput}
									onChange={(e) => setTagInput(e.target.value)}
									onKeyDown={handleTagKeyDown}
									placeholder="Add tags (press Enter)"
									disabled={isLoading}
									className="flex-grow"
								/>
								<Button
									type="button"
									onClick={addTag}
									disabled={isLoading || !tagInput.trim()}
								>
									<Tag />
								</Button>
							</div>
							{tags.length > 0 && (
								<div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
									{tags.map((tag, index) => (
										<Badge key={index} variant="outline" className="flex items-center gap-1.5">
											{tag}
											<Button
												type="button"
												variant="ghost"
												scale="sm"
												onClick={() => removeTag(index)}
												disabled={isLoading}
												className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
											>
												<X className="h-3 w-3" />
											</Button>
										</Badge>
									))}
								</div>
							)}
						</div>
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
							onClick={handleCreateShelf}
							disabled={isLoading || !title.trim()}
						>
							{isLoading ? (
								<> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating... </>
							) : 'Create Shelf'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}