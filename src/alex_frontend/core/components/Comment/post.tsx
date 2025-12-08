import React, { useState } from "react";
import { Button } from "@/lib/components/button";
import { Textarea } from "@/lib/components/textarea";
import { Send } from "lucide-react";
import { useAlexBackend } from "@/hooks/actors";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { toast } from "sonner";

interface AddCommentProps {
	arweaveId: string;
	onCommentAdded?: () => void;
	maxLength?: number;
	className?: string;
}

const AddComment: React.FC<AddCommentProps> = ({
	arweaveId,
	onCommentAdded,
	maxLength = 1000,
	className = "",
}) => {
	const [comment, setComment] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const { actor } = useAlexBackend();
	const { user } = useAppSelector((state) => state.auth);

	const handleAddComment = async () => {
		if (!actor || !user || !comment.trim()) return;

		try {
			setSubmitting(true);
			const result = await actor.add_comment(arweaveId, comment.trim());
			
			if ('Ok' in result) {
				setComment("");
				toast.success("Comment added successfully!");
				onCommentAdded?.();
			} else {
				console.error("Error adding comment:", result.Err);
				toast.error("Failed to add comment");
			}
		} catch (error) {
			console.error('Failed to add comment:', error);
			toast.error("Failed to add comment");
		} finally {
			setSubmitting(false);
		}
	};

	const isCommentValid = comment.trim().length > 0 && comment.trim().length <= maxLength;

	if (!user) {
		return (
			<div className={`text-center py-4 text-muted-foreground ${className}`}>
				<p className="text-sm">Sign in to leave a comment</p>
			</div>
		);
	}

	return (
		<div className={`relative ${className}`}>
			<Textarea
				value={comment}
				onChange={(e) => setComment(e.target.value)}
				placeholder="Add a comment..."
				className="min-h-[80px] resize-none pr-12 pb-8"
				maxLength={maxLength}
				disabled={submitting}
			/>
			{/* Character count - positioned above textarea */}
			<div className="absolute top-2 right-3 text-xs text-muted-foreground">
				{comment.length}/{maxLength}
			</div>
			{/* Submit button - floating bottom right */}
			<Button
				onClick={handleAddComment}
				disabled={!isCommentValid || submitting}
				scale="sm"
				className="absolute bottom-2 right-2 h-8 w-8 p-0 rounded-full"
				title={submitting ? "Posting..." : "Post comment"}
			>
				<Send className="h-4 w-4" />
			</Button>
		</div>
	);
};

export default AddComment;