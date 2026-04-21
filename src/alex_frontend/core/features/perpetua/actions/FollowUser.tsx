import React from "react";
import { UserRoundPlus, UserRoundCheck, Loader2 } from "lucide-react";
import { Button } from "@/lib/components/button";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { useFollowUser, useUnfollowUser } from "../hooks/useMutations";
import { useFollowedUsers } from "../hooks/useFollow";

interface FollowUserProps {
	userId: string;
	variant?: "icon" | "full";
}

export default function FollowUser({ userId, variant = "icon" }: FollowUserProps) {
	const currentUser = useAppSelector((state) => state.auth.user);
	const { data: followedUsers } = useFollowedUsers();
	const followUser = useFollowUser();
	const unfollowUser = useUnfollowUser();

	// Don't show follow button for own profile
	if (currentUser?.principal === userId) return null;

	const isFollowing = followedUsers?.includes(userId) ?? false;
	const isPending = followUser.isPending || unfollowUser.isPending;

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isFollowing) {
			unfollowUser.mutate(userId);
		} else {
			followUser.mutate(userId);
		}
	};

	if (variant === "full") {
		return (
			<Button
				variant={isFollowing ? "secondary" : "primary"}
				scale="sm"
				onClick={handleClick}
				disabled={isPending}
				className="transition-all duration-150"
			>
				{isPending ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : isFollowing ? (
					<UserRoundCheck className="h-4 w-4" />
				) : (
					<UserRoundPlus className="h-4 w-4" />
				)}
				{isFollowing ? "Following" : "Follow"}
			</Button>
		);
	}

	return (
		<button
			onClick={handleClick}
			disabled={isPending}
			className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
		>
			{isPending ? (
				<Loader2 className="h-3 w-3 animate-spin" />
			) : isFollowing ? (
				<UserRoundCheck className="h-3 w-3 text-primary" />
			) : (
				<UserRoundPlus className="h-3 w-3" />
			)}
		</button>
	);
}
