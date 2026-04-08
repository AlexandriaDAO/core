import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, FolderPlus, AlertCircle } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Textarea } from "@/lib/components/textarea";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/lib/components/dialog";
import { useCreateShelf } from "../hooks/useMutations";

interface CreateShelfProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function CreateShelf({ open, onOpenChange }: CreateShelfProps) {
	const navigate = useNavigate();
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [error, setError] = useState<string | null>(null);
	const createShelf = useCreateShelf();

	const canSubmit = title.trim().length > 0 && !createShelf.isPending;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!canSubmit) return;
		setError(null);

		try {
			const shelfId = await createShelf.mutateAsync({
				title: title.trim(),
				description: description.trim() || undefined,
			});

			setTitle("");
			setDescription("");
			onOpenChange(false);
			navigate({ to: "/app/perpetua/shelf/$shelfId", params: { shelfId } });
		} catch (err: any) {
			setError(err?.message || "Failed to create shelf.");
		}
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) setError(null);
		onOpenChange(open);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<FolderPlus className="h-5 w-5" />
							New Shelf
						</DialogTitle>
						<DialogDescription>Create a new shelf to curate content.</DialogDescription>
					</DialogHeader>

					<div className="flex flex-col gap-4 py-4">
						{error && (
							<div className="flex items-center gap-2 rounded-md bg-destructive/10 dark:bg-red-900/30 border border-destructive/20 dark:border-red-800/50 px-3 py-2 text-sm text-destructive dark:text-red-400">
								<AlertCircle className="h-4 w-4 shrink-0" />
								{error}
							</div>
						)}

						<div className="flex flex-col gap-1.5">
							<Label htmlFor="shelf-title">Title</Label>
							<Input
								id="shelf-title"
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value.slice(0, 100))}
								placeholder="Give your shelf a name"
								scale="sm"
								rounded="md"
								autoFocus
							/>
							<span className="text-sm text-muted-foreground dark:text-gray-400 text-right">{title.length}/100</span>
						</div>

						<div className="flex flex-col gap-1.5">
							<Label htmlFor="shelf-description">Description (optional)</Label>
							<Textarea
								id="shelf-description"
								value={description}
								onChange={(e) => setDescription(e.target.value.slice(0, 500))}
								placeholder="What is this shelf about?"
								className="resize-none bg-white text-black border-gray-400 dark:bg-gray-800 dark:text-foreground dark:border-gray-600 font-roboto-condensed font-medium focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-gray-700"
								rows={3}
							/>
							<span className="text-sm text-muted-foreground dark:text-gray-400 text-right">{description.length}/500</span>
						</div>
					</div>

					<DialogFooter>
						<Button type="button" variant="secondary" scale="sm" onClick={() => handleOpenChange(false)}>
							Cancel
						</Button>
						<Button type="submit" variant="primary" scale="sm" disabled={!canSubmit}>
							{createShelf.isPending ? (
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
							) : null}
							Create
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
