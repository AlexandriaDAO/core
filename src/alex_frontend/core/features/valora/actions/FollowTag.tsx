import React from "react";
import { Bookmark, Loader2 } from "lucide-react";
import { Badge } from "@/lib/components/badge";
import { useFollowTag, useUnfollowTag } from "../hooks/useMutations";
import { useFollowedTags } from "../hooks/useFollow";

interface FollowTagProps {
	tag: string;
}

export default function FollowTag({ tag }: FollowTagProps) {
	const { data: followedTags } = useFollowedTags();
	const followTag = useFollowTag();
	const unfollowTag = useUnfollowTag();

	const isFollowing = followedTags?.includes(tag) ?? false;
	const isPending = followTag.isPending || unfollowTag.isPending;

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isFollowing) {
			unfollowTag.mutate(tag);
		} else {
			followTag.mutate(tag);
		}
	};

	return (
		<Badge
			variant="outline"
			className="flex items-center px-1.5 rounded-l-none rounded-r-full cursor-pointer bg-gray-50 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
			onClick={handleClick}
		>
			{isPending ? (
				<Loader2 className="h-3 w-3 animate-spin" />
			) : (
				<Bookmark className={`h-3 w-3 ${isFollowing ? "fill-primary text-primary" : ""}`} />
			)}
		</Badge>
	);
}
