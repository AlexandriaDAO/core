import React, { useState, useEffect } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { Textarea } from "@/lib/components/textarea";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/lib/components/tooltip";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/lib/components/dialog";
import { useUpdateShelfMetadata } from "../hooks/useMutations";

interface EditShelfMetaProps {
	shelfId: string;
	currentTitle: string;
	currentDescription: string | null;
}

export default function EditShelfMeta({ shelfId, currentTitle, currentDescription }: EditShelfMetaProps) {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState(currentTitle);
	const [description, setDescription] = useState(currentDescription ?? "");
	const updateMeta = useUpdateShelfMetadata();

	useEffect(() => {
		if (open) {
			setTitle(currentTitle);
			setDescription(currentDescription ?? "");
		}
	}, [open, currentTitle, currentDescription]);

	const hasChanges = title.trim() !== currentTitle || description.trim() !== (currentDescription ?? "");
	const canSubmit = title.trim().length > 0 && hasChanges && !updateMeta.isPending;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!canSubmit) return;

		await updateMeta.mutateAsync({
			shelfId,
			title: title.trim(),
			description: description.trim(),
		});
		setOpen(false);
	};

	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="ghost" scale="sm" onClick={() => setOpen(true)} className="h-8 w-8 p-0">
						<Pencil className="h-4 w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>Edit shelf details</TooltipContent>
			</Tooltip>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<form onSubmit={handleSubmit}>
						<DialogHeader>
							<DialogTitle>Edit Shelf</DialogTitle>
							<DialogDescription>Update the title and description.</DialogDescription>
						</DialogHeader>

						<div className="flex flex-col gap-4 py-4">
							<div className="flex flex-col gap-1.5">
								<label className="text-sm font-medium">Title</label>
								<Input
									type="text"
									value={title}
									onChange={(e) => setTitle(e.target.value.slice(0, 100))}
									scale="sm"
									rounded="md"
									autoFocus
								/>
								<span className="text-sm text-muted-foreground dark:text-gray-400 text-right">{title.length}/100</span>
							</div>

							<div className="flex flex-col gap-1.5">
								<label className="text-sm font-medium">Description</label>
								<Textarea
									value={description}
									onChange={(e) => setDescription(e.target.value.slice(0, 500))}
									className="resize-none bg-white text-black border-gray-400 dark:bg-gray-800 dark:text-foreground dark:border-gray-600 font-roboto-condensed font-medium focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-gray-700"
									rows={3}
								/>
								<span className="text-sm text-muted-foreground dark:text-gray-400 text-right">{description.length}/500</span>
							</div>
						</div>

						<DialogFooter>
							<Button type="button" variant="secondary" scale="sm" onClick={() => setOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" variant="primary" scale="sm" disabled={!canSubmit}>
								{updateMeta.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
								Save
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}
