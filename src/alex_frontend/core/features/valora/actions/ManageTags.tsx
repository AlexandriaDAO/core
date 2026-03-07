import React, { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { Badge } from "@/lib/components/badge";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { useAddTag, useRemoveTag } from "../hooks/useMutations";

const MAX_TAGS = 3;
const MAX_TAG_LENGTH = 25;

interface ManageTagsProps {
	shelfId: string;
	tags: string[];
}

export default function ManageTags({ shelfId, tags }: ManageTagsProps) {
	const [newTag, setNewTag] = useState("");
	const [showInput, setShowInput] = useState(false);
	const [error, setError] = useState("");
	const addTag = useAddTag();
	const removeTag = useRemoveTag();

	const handleChange = (value: string) => {
		// Strip non-alphanumeric characters
		const cleaned = value.replace(/[^a-zA-Z0-9]/g, "").slice(0, MAX_TAG_LENGTH);
		setNewTag(cleaned);
		setError(value !== cleaned && value.length > 0 ? "Only letters and numbers allowed" : "");
	};

	const handleAdd = async () => {
		const tag = newTag.trim().toLowerCase();
		if (!tag) return;

		if (tags.includes(tag)) {
			setError("Tag already exists");
			return;
		}
		if (tags.length >= MAX_TAGS) {
			setError(`Maximum ${MAX_TAGS} tags per shelf`);
			return;
		}

		try {
			await addTag.mutateAsync({ shelfId, tag });
			setNewTag("");
			setError("");
			setShowInput(false);
		} catch (e: any) {
			setError(e?.message || "Failed to add tag");
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleAdd();
		}
		if (e.key === "Escape") {
			setNewTag("");
			setError("");
			setShowInput(false);
		}
	};

	const handleClose = () => {
		setNewTag("");
		setError("");
		setShowInput(false);
	};

	const atLimit = tags.length >= MAX_TAGS;

	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex gap-2 flex-wrap items-center">
				{tags.map((tag) => (
					<Badge key={tag} variant="outline" className="text-xs py-0.5 px-2.5 bg-gray-50 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600">
						{tag}
						<button
							onClick={() => removeTag.mutate({ shelfId, tag })}
							className="ml-1.5 hover:text-destructive transition-colors"
							disabled={removeTag.isPending}
						>
							<X className="h-3.5 w-3.5" />
						</button>
					</Badge>
				))}

				{showInput ? (
					<div className="flex items-center gap-1.5">
						<Input
							type="text"
							value={newTag}
							onChange={(e) => handleChange(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="tagname"
							className="w-28"
							scale="sm"
							rounded="md"
							autoFocus
						/>
						<Button
							variant="ghost"
							scale="sm"
							className="h-8 w-8 p-0"
							onClick={handleAdd}
							disabled={addTag.isPending || !newTag.trim()}
						>
							{addTag.isPending ? (
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
							) : (
								<Plus className="h-3.5 w-3.5" />
							)}
						</Button>
						<Button
							variant="ghost"
							scale="sm"
							className="h-8 w-8 p-0"
							onClick={handleClose}
						>
							<X className="h-3.5 w-3.5" />
						</Button>
					</div>
				) : (
					<button
						className={`inline-flex items-center text-xs py-0.5 px-2.5 rounded-full border border-dashed transition-colors ${
							atLimit
								? "border-gray-200 text-gray-300 cursor-not-allowed dark:border-gray-700 dark:text-gray-600"
								: "border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 dark:border-gray-600 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:border-gray-500"
						}`}
						onClick={() => { if (!atLimit) setShowInput(true); else setError(`Maximum ${MAX_TAGS} tags per shelf`); }}
					>
						<Plus className="h-3 w-3 mr-1" />
						Add
					</button>
				)}
			</div>

			{error && (
				<p className="text-xs text-destructive dark:text-red-400">{error}</p>
			)}
		</div>
	);
}
