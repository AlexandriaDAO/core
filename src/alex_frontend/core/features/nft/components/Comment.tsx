import React, { useState, useEffect } from "react";
import { Button } from "@/lib/components/button";
import { Textarea } from "@/lib/components/textarea";
import { useAlexBackend } from "@/hooks/actors";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { toast } from "sonner";
import { Principal } from "@dfinity/principal";
import { convertTimestamp } from "@/utils/general";

interface Comment {
	id: bigint;
	user: Principal;
	comment: string;
	created_at: bigint;
}

interface CommentProps {
	arweaveId: string;
}

const Comment: React.FC<CommentProps> = ({ arweaveId }) => {
	const [comments, setComments] = useState<Comment[]>([]);
	const [newComment, setNewComment] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	
	const { actor } = useAlexBackend();
	const { user } = useAppSelector((state) => state.auth);

	// Fetch comments
	const fetchComments = async () => {
		if (!actor) return;
		
		try {
			setIsLoading(true);
			const result = await actor.get_comments(arweaveId);
			
			if ('Ok' in result) {
				setComments(result.Ok);
			} else {
				console.error("Error fetching comments:", result.Err);
				toast.error("Failed to load comments");
			}
		} catch (error) {
			console.error("Error fetching comments:", error);
			toast.error("Failed to load comments");
		} finally {
			setIsLoading(false);
		}
	};

	// Submit new comment
	const handleSubmitComment = async () => {
		if (!actor || !newComment.trim()) return;

		try {
			setIsSubmitting(true);
			const result = await actor.add_comment(arweaveId, newComment.trim());
			
			if ('Ok' in result) {
				setNewComment("");
				toast.success("Comment added successfully!");
				fetchComments(); // Refresh comments
			} else {
				console.error("Error adding comment:", result.Err);
				toast.error("Failed to add comment");
			}
		} catch (error) {
			console.error("Error adding comment:", error);
			toast.error("Failed to add comment");
		} finally {
			setIsSubmitting(false);
		}
	};


	useEffect(() => {
		if (actor && arweaveId) {
			fetchComments();
		}
	}, [actor, arweaveId]);

	const canComment = user;
	const isCommentValid = newComment.trim().length > 0 && newComment.trim().length <= 1000;

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-muted-foreground"></div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Comment Form */}
			{canComment && (
				<div className="space-y-2">
					<Textarea
						placeholder="Write a comment..."
						value={newComment}
						onChange={(e) => setNewComment(e.target.value)}
						className="min-h-[80px] resize-none"
						maxLength={1000}
					/>
					<div className="flex justify-between items-center">
						<span className="text-xs text-muted-foreground">
							{newComment.length}/1000 characters
						</span>
						<Button
							onClick={handleSubmitComment}
							disabled={!isCommentValid || isSubmitting}
							scale="sm"
						>
							{isSubmitting ? "Posting..." : "Post Comment"}
						</Button>
					</div>
				</div>
			)}

			{!canComment && (
				<div className="text-center py-4 text-muted-foreground">
					<p className="text-sm">Sign in to leave a comment</p>
				</div>
			)}

			{/* Comments List */}
			<div className="space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
				{comments.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<p className="text-sm">No comments yet. Be the first to comment!</p>
					</div>
				) : (
					comments.map((comment) => (
						<div 
							key={comment.id.toString()} 
							className="border border-border rounded-lg p-3 space-y-2"
						>
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<span className="font-mono">
									{comment.user.toString().slice(0, 8)}...
								</span>
								<span>•</span>
								<span>
									{convertTimestamp(Number(comment.created_at) / 1000000, 'relative')}
								</span>
							</div>
							<p className="mt-1 text-sm whitespace-pre-wrap break-words">
								{comment.comment}
							</p>
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default Comment;