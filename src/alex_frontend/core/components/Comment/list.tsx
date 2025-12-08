import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/lib/components/card";
import { useAlexBackend } from "@/hooks/actors";
import { Principal } from "@dfinity/principal";
import { convertTimestamp } from "@/utils/general";
import UsernameBadge from "@/components/UsernameBadge";

interface Comment {
	id: string | bigint;
	author: string | Principal;
	content: string;
	timestamp: string | bigint;
}

interface CommentListProps {
	arweaveId: string;
	refreshTrigger?: number;
	showUserBadge?: boolean;
	variant?: 'default' | 'compact';
	className?: string;
}

const CommentList: React.FC<CommentListProps> = ({
	arweaveId,
	refreshTrigger = 0,
	showUserBadge = true,
	variant = 'default',
	className = "",
}) => {
	const [comments, setComments] = useState<Comment[]>([]);
	const [loading, setLoading] = useState(true);
	const { actor } = useAlexBackend();

	const fetchComments = async () => {
		if (!actor) return;

		try {
			setLoading(true);
			const result = await actor.get_comments(arweaveId);
			
			if ('Ok' in result) {
				// Normalize comment data structure to handle different formats
				const fetchedComments: Comment[] = result.Ok.map((comment: any, index: number) => ({
					id: comment.id || `${arweaveId}-${index}`,
					author: comment.author || comment.user,
					content: comment.content || comment.comment,
					timestamp: comment.created_at?.toString() || comment.timestamp?.toString() || Date.now().toString(),
				}));
				setComments(fetchedComments);
			} else {
				console.error("Error fetching comments:", result.Err);
			}
		} catch (error) {
			console.error('Failed to fetch comments:', error);
		} finally {
			setLoading(false);
		}
	};

	const formatTimestamp = (timestamp: string | bigint) => {
		try {
			const timestampNum = typeof timestamp === 'bigint' ? Number(timestamp) : parseInt(timestamp);
			// Handle both milliseconds and nanoseconds
			const date = new Date(timestampNum > 1e12 ? timestampNum / 1000000 : timestampNum);
			return convertTimestamp(date.getTime() / 1000, 'relative');
		} catch {
			return "unknown";
		}
	};

	const formatAuthor = (author: string | Principal) => {
		const authorString = typeof author === 'string' ? author : author.toString();
		return authorString.slice(0, 8) + '...';
	};

	useEffect(() => {
		fetchComments();
	}, [arweaveId, actor, refreshTrigger]);

	if (loading) {
		return (
			<div className={`flex justify-center py-4 ${className}`}>
				<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-muted-foreground"></div>
			</div>
		);
	}

	if (comments.length === 0) {
		return (
			<div className={`text-center text-sm text-muted-foreground py-4 ${className}`}>
				No comments yet. Be the first to comment!
			</div>
		);
	}

	return (
		<div className={`space-y-3 max-h-96 overflow-y-auto ${className}`}>
			{comments.map((comment) => (
				<Card 
					key={comment.id.toString()} 
					className={variant === 'compact' ? 'border-l-2 border-l-primary/20' : ''}
				>
					<CardContent className={variant === 'compact' ? 'p-3' : 'p-4'}>
						<div className="flex items-center gap-2 mb-2">
							{showUserBadge ? (
								<UsernameBadge principal={comment.author.toString()} />
							) : (
								<span className="font-mono text-xs text-muted-foreground">
									{formatAuthor(comment.author)}
								</span>
							)}
							<span className="text-xs text-muted-foreground">
								{formatTimestamp(comment.timestamp)}
							</span>
						</div>
						<p className="text-sm whitespace-pre-wrap break-words">
							{comment.content}
						</p>
					</CardContent>
				</Card>
			))}
		</div>
	);
};

export default CommentList;