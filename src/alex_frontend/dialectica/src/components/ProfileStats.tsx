import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/lib/components/card";
import { Heart, MessageCircle, FileText, Coins } from "lucide-react";
import { Principal } from "@dfinity/principal";
import UsernameBadge from "@/components/UsernameBadge";
import { useAlexBackend } from "@/hooks/actors";
import { arweaveClient } from "@/utils/arweaveClient";

interface ProfileStatsProps {
	userPrincipal: string;
	className?: string;
	variant?: 'default' | 'inline';
}

interface UserStats {
	postsCount: number;
	totalLikes: number;
	totalComments: number;
	nftsOwned: number;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({
	userPrincipal,
	className = "",
	variant = 'default',
}) => {
	const [stats, setStats] = useState<UserStats>({
		postsCount: 0,
		totalLikes: 0,
		totalComments: 0,
		nftsOwned: 0,
	});
	const [loading, setLoading] = useState(true);
	const { actor } = useAlexBackend();

	const fetchUserStats = async () => {
		try {
			setLoading(true);

			// Fetch user's posts from Arweave
			const query = `
				query {
					transactions(
						tags: [
							{ name: "Application-Id", values: ["dialectica"] }
							, { name: "User-Principal", values: ["${userPrincipal}"] }
						]
						first: 100
					) {
						edges {
							node {
								id
							}
						}
					}
				}
			`;

			const response = await fetch('https://arweave.net/graphql', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ query }),
			});

			const result = await response.json();
			const userPosts = result.data?.transactions?.edges || [];
			const postsCount = userPosts.length;

			// Fetch activity stats from Dialectica backend
			let totalLikes = 0;
			let totalComments = 0;
			
			if (actor) {
				try {
					const activities = await actor.get_user_activities(
						Principal.fromText(userPrincipal)
					);
					
					if ('Ok' in activities) {
						// Count likes and comments
						activities.Ok.forEach((activity: any) => {
							if ('Reaction' in activity.activity_type && 'Like' in activity.activity_type.Reaction) {
								totalLikes++;
							} else if ('Comment' in activity.activity_type) {
								totalComments++;
							}
						});
					}
				} catch (error) {
					console.warn('Failed to fetch user activities:', error);
				}
			}

			// For NFTs count, we would need to integrate with NFT manager
			// For now, use posts count as proxy
			const nftsOwned = postsCount;

			setStats({
				postsCount,
				totalLikes,
				totalComments,
				nftsOwned,
			});
		} catch (error) {
			console.error('Error fetching user stats:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUserStats();
	}, [userPrincipal, actor]);

	const statItems = [
		{
			icon: FileText,
			label: "Posts",
			value: stats.postsCount,
			color: "text-blue-600",
		},
		{
			icon: Heart,
			label: "Likes",
			value: stats.totalLikes,
			color: "text-green-600",
		},
		{
			icon: MessageCircle,
			label: "Comments",
			value: stats.totalComments,
			color: "text-purple-600",
		},
	];

	if (variant === 'inline') {
		return (
			<div className={`space-y-4 ${className}`}>
				{/* Username - centered but only as wide as content */}
				<div className="flex justify-center">
					<UsernameBadge principal={userPrincipal} />
				</div>

				{/* Stats */}
				<div className="flex justify-center gap-6">
					{statItems.map((item) => (
						<div key={item.label} className="text-center">
							<div className="flex items-center justify-center gap-1 mb-1">
								<item.icon className={`h-4 w-4 ${item.color}`} />
								<span className="font-roboto-condensed font-bold text-lg">
									{loading ? "..." : item.value.toLocaleString()}
								</span>
							</div>
							<p className="text-xs text-muted-foreground font-roboto-condensed">
								{item.label}
							</p>
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className={`space-y-6 ${className}`}>
			{/* User Info */}
			<div className="text-center space-y-3">
				<div className="flex justify-center">
					<UsernameBadge principal={userPrincipal} />
				</div>
				<p className="text-xs text-muted-foreground font-mono break-all">
					{userPrincipal}
				</p>
			</div>

			{/* Stats Rows */}
			<div className="space-y-2">
				{statItems.map((item) => (
					<div
						key={item.label}
						className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/30 border border-muted hover:bg-muted/50 transition-colors"
					>
						<div className="flex items-center gap-2">
							<item.icon className={`h-4 w-4 ${item.color}`} />
							<span className="font-roboto-condensed font-medium text-sm">
								{item.label}
							</span>
						</div>
						<span className="text-lg font-roboto-condensed font-bold">
							{loading ? "..." : item.value.toLocaleString()}
						</span>
					</div>
				))}
			</div>

			{/* Additional Info */}
			<div className="text-center text-xs text-muted-foreground space-y-1 pt-4 border-t border-muted">
				<p className="font-roboto-condensed">Member of Dialectica</p>
				<p className="font-roboto-condensed">Posts stored on Arweave</p>
			</div>
		</div>
	);
};

export default ProfileStats;