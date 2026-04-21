import React, { useState, useEffect } from "react";
import { Button } from "@/lib/components/button";
import { Textarea } from "@/lib/components/textarea";
import { useAlexBackend } from "@/hooks/actors";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { toast } from "sonner";
import { Principal } from "@dfinity/principal";
import { convertTimestamp } from "@/utils/general";
import { SendHorizontal, Loader2, Pencil, Trash2, X, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { user as userCanister } from "../../../../../declarations/user";
import { Link } from "@tanstack/react-router";

const CommentUsername: React.FC<{ principal: string }> = ({ principal }) => {
	const { data } = useQuery({
		queryKey: ['user', principal],
		queryFn: async () => userCanister.get_user(Principal.fromText(principal)),
		enabled: !!principal && principal !== Principal.anonymous().toString(),
		retry: false,
		staleTime: 5 * 60 * 1000,
	});

	const username = data && 'Ok' in data ? data.Ok.username : null;

	return (
		<Link to="/user/$principal" params={{ principal }} className="font-medium text-foreground/70 hover:text-foreground transition-colors">
			{username ? `@${username}` : `${principal.slice(0, 8)}...`}
		</Link>
	);
};

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
	const [editingId, setEditingId] = useState<bigint | null>(null);
	const [editText, setEditText] = useState("");
	const [deletingId, setDeletingId] = useState<bigint | null>(null);

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


	const handleEditComment = async (commentId: bigint) => {
		if (!actor || !editText.trim()) return;

		try {
			setIsSubmitting(true);
			const result = await actor.update_comment(commentId, editText.trim());

			if ('Ok' in result) {
				setEditingId(null);
				setEditText("");
				toast.success("Comment updated");
				fetchComments();
			} else {
				toast.error("Failed to update comment");
			}
		} catch (error) {
			console.error("Error updating comment:", error);
			toast.error("Failed to update comment");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteComment = async (commentId: bigint) => {
		if (!actor) return;

		try {
			setDeletingId(commentId);
			const result = await actor.remove_comment(commentId);

			if ('Ok' in result) {
				toast.success("Comment deleted");
				fetchComments();
			} else {
				toast.error("Failed to delete comment");
			}
		} catch (error) {
			console.error("Error deleting comment:", error);
			toast.error("Failed to delete comment");
		} finally {
			setDeletingId(null);
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
				<div className="relative">
					<Textarea
						placeholder="Write a comment..."
						value={newComment}
						onChange={(e) => setNewComment(e.target.value)}
						className="min-h-[80px] resize-none border-border focus-visible:ring-offset-0 pr-12"
						maxLength={1000}
					/>
					<Button
						onClick={handleSubmitComment}
						disabled={!isCommentValid || isSubmitting}
						scale="icon"
						rounded="full"
						variant="link"
						className="absolute right-2 bottom-2"
					>
						{isSubmitting ? (
							<Loader2 size={16} className="animate-spin" />
						) : (
							<SendHorizontal size={16} />
						)}
					</Button>
					<span className="absolute left-2 bottom-2 text-xs text-muted-foreground">
						{newComment.length}/1000
					</span>
				</div>
			)}

			{!canComment && (
				<div className="text-center py-4 text-muted-foreground">
					<p className="text-sm">Sign in to leave a comment</p>
				</div>
			)}

			{/* Comments List */}
			<div className="space-y-3 overflow-y-auto max-h-64 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
				{comments.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<p className="text-sm">No comments yet. Be the first to comment!</p>
					</div>
				) : (
					comments.map((comment) => {
						const isAuthor = user?.principal === comment.user.toString();
						const isEditing = editingId === comment.id;

						return (
							<div
								key={comment.id.toString()}
								className="group rounded-lg bg-gray-200/80 dark:bg-gray-800/60 p-3 space-y-1.5 transition-colors"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
										<CommentUsername principal={comment.user.toString()} />
										<span className="opacity-40">·</span>
										<span className="opacity-70">
											{convertTimestamp(comment.created_at, 'relative')}
										</span>
									</div>
									{isAuthor && (
										<div className="flex items-center gap-0.5">
											{isEditing ? (
												<>
													<Button
														scale="icon"
														variant="ghost"
														rounded="full"
														className="h-6 w-6 text-muted-foreground hover:text-destructive"
														onClick={() => {
															setEditingId(null);
															setEditText("");
														}}
													>
														<X size={14} />
													</Button>
													<Button
														scale="icon"
														variant="ghost"
														rounded="full"
														className="h-6 w-6 text-muted-foreground hover:text-constructive"
														onClick={() => handleEditComment(comment.id)}
														disabled={!editText.trim() || isSubmitting}
													>
														{isSubmitting ? (
															<Loader2 size={14} className="animate-spin" />
														) : (
															<Check size={14} />
														)}
													</Button>
												</>
											) : (
												<>
													<Button
														scale="icon"
														variant="ghost"
														rounded="full"
														className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
														onClick={() => {
															setEditingId(comment.id);
															setEditText(comment.comment);
														}}
													>
														<Pencil size={12} />
													</Button>
													<Button
														scale="icon"
														variant="ghost"
														rounded="full"
														className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
														onClick={() => handleDeleteComment(comment.id)}
														disabled={deletingId === comment.id}
													>
														{deletingId === comment.id ? (
															<Loader2 size={12} className="animate-spin" />
														) : (
															<Trash2 size={12} />
														)}
													</Button>
												</>
											)}
										</div>
									)}
								</div>

								{isEditing ? (
									<Textarea
										value={editText}
										onChange={(e) => setEditText(e.target.value)}
										className="min-h-[60px] resize-none border-border focus-visible:ring-offset-0"
										maxLength={1000}
									/>
								) : (
									<p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
										{comment.comment}
									</p>
								)}
							</div>
						);
					})
				)}
			</div>
		</div>
	);
};

export default Comment;