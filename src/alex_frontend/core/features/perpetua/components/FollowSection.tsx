import React from "react";
import { useNavigate } from "@tanstack/react-router";
import { X, Loader2, Heart } from "lucide-react";
import { Badge } from "@/lib/components/badge";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useUsername } from "@/hooks/useUsername";
import { setTagFilter } from "../store/slice";
import { useFollowedTags, useFollowedUsers } from "../hooks/useFollow";
import { useUnfollowTag, useUnfollowUser } from "../hooks/useMutations";
import { shortenPrincipal } from "../utils";

function UserBadge({ userId }: { userId: string }) {
	const navigate = useNavigate();
	const unfollowUser = useUnfollowUser();
	const { username } = useUsername(userId);

	return (
		<Badge
			variant="outline"
			className="text-xs py-0.5 px-2.5 cursor-pointer bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
		>
			<span onClick={() => navigate({ to: "/app/perpetua/user/$userId", params: { userId } })}>
				{username ? `@${username}` : shortenPrincipal(userId)}
			</span>
			<button
				onClick={() => unfollowUser.mutate(userId)}
				className="ml-1.5 hover:text-destructive transition-colors"
				disabled={unfollowUser.isPending}
			>
				<X className="h-3.5 w-3.5" />
			</button>
		</Badge>
	);
}

export default function FollowSection() {
	const dispatch = useAppDispatch();
	const { data: followedTags, isLoading: tagsLoading } = useFollowedTags();
	const { data: followedUsers, isLoading: usersLoading } = useFollowedUsers();
	const unfollowTag = useUnfollowTag();

	const isLoading = tagsLoading || usersLoading;
	const hasTags = (followedTags?.length ?? 0) > 0;
	const hasUsers = (followedUsers?.length ?? 0) > 0;

	if (isLoading) {
		return (
			<div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-gray-400 animate-fade">
				<Loader2 className="h-4 w-4 animate-spin" />
				Loading...
			</div>
		);
	}

	if (!hasTags && !hasUsers) {
		return (
			<div className="flex flex-col items-center gap-3 py-8 text-muted-foreground dark:text-gray-400 animate-fade">
				<div className="h-10 w-10 rounded-full bg-muted dark:bg-gray-800 flex items-center justify-center">
					<Heart className="h-5 w-5" />
				</div>
				<p className="text-sm">You're not following any tags or users yet.</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4 animate-fade">
			{hasTags && (
				<div className="flex flex-col gap-2">
					<span className="text-sm font-medium text-muted-foreground dark:text-gray-400 uppercase tracking-wide">Tags</span>
					<div className="flex gap-2 flex-wrap">
						{followedTags!.map((tag) => (
							<Badge
								key={tag}
								variant="outline"
								className="text-xs py-0.5 px-2.5 cursor-pointer bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
							>
								<span onClick={() => dispatch(setTagFilter(tag))}>{tag}</span>
								<button
									onClick={() => unfollowTag.mutate(tag)}
									className="ml-1.5 hover:text-destructive transition-colors"
									disabled={unfollowTag.isPending}
								>
									<X className="h-3.5 w-3.5" />
								</button>
							</Badge>
						))}
					</div>
				</div>
			)}

			{hasUsers && (
				<div className="flex flex-col gap-2">
					<span className="text-sm font-medium text-muted-foreground dark:text-gray-400 uppercase tracking-wide">Users</span>
					<div className="flex gap-2 flex-wrap">
						{followedUsers!.map((userId) => (
							<UserBadge key={userId} userId={userId} />
						))}
					</div>
				</div>
			)}
		</div>
	);
}
