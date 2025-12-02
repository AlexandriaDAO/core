import React, { useState } from "react";
import { MessageSquare, ThumbsUp, Calendar, User2 } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/lib/components/tabs";
import { Card, CardContent, CardHeader } from "@/lib/components/card";
import { useRouter } from "@tanstack/react-router";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { Principal } from "@dfinity/principal";
import ProfileStats from "../components/ProfileStats";
import ProfilePostsList from "../components/ProfilePostsList";
import UsernameBadge from "@/components/UsernameBadge";
import useDialectica from "@/hooks/actors/useDialectica";

interface ProfilePageProps {
	userPrincipal?: string; // If not provided, show current user's profile
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userPrincipal }) => {
	const router = useRouter();
	const { user } = useAppSelector((state) => state.auth);
	const [activeTab, setActiveTab] = useState("posts");
	
	// Use provided userPrincipal or current user's principal
	const profilePrincipal = userPrincipal || user?.principal;
	const isOwnProfile = user?.principal === profilePrincipal;

	const handleGoBack = () => {
		router.history.back();
	};

	if (!profilePrincipal) {
		return (
			<div className="max-w-4xl mx-auto py-8">
				<Card className="text-center">
					<CardContent className="p-12">
						<User2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
						<h1 className="text-2xl font-roboto-condensed font-semibold mb-4">Profile Not Found</h1>
						<p className="text-muted-foreground">
							No user profile to display.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-4">
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				{/* Left Column - Profile & Activity */}
				<div className="lg:col-span-1 space-y-6">
					{/* Profile Card */}
					<Card className="overflow-hidden">
						{/* Cover Background */}
						<div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5"></div>
						
						<CardContent className="relative px-6 pb-6">
							{/* Avatar - positioned to overlap cover */}
							<div className="flex justify-center -mt-10 mb-2">
								<div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 p-0.5 shadow-lg">
									<div className="h-full w-full rounded-full bg-background flex items-center justify-center">
										<User2 className="h-8 w-8 text-primary" />
									</div>
								</div>
							</div>
							
							{/* Stats */}
							<div className="text-center">
								<ProfileStats userPrincipal={profilePrincipal} variant="inline" />
							</div>
						</CardContent>
					</Card>

					{/* Activity Section */}
					<Card>
						<CardHeader className="pb-3">
							<h3 className="text-sm font-roboto-condensed font-semibold">Recent Activity</h3>
						</CardHeader>
						<CardContent className="p-0 max-h-[600px] overflow-y-auto">
							<ActivityFeedCompact userPrincipal={profilePrincipal} />
						</CardContent>
					</Card>
				</div>

				{/* Right Columns - Posts */}
				<div className="lg:col-span-3">
					<ProfilePostsList userPrincipal={profilePrincipal} />
				</div>
			</div>
		</div>
	);
};

// Compact Activity Feed for Sidebar
const ActivityFeedCompact: React.FC<{ userPrincipal: string }> = ({ userPrincipal }) => {
	const { actor } = useDialectica();
	const [activities, setActivities] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	React.useEffect(() => {
		const fetchActivities = async () => {
			if (!actor) return;

			try {
				const result = await actor.get_user_activities(
					Principal.fromText(userPrincipal)
				);
				
				if ('Ok' in result) {
					setActivities(result.Ok);
				}
			} catch (error) {
				console.error('Failed to fetch activities:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchActivities();
	}, [userPrincipal, actor]);

	if (loading) {
		return (
			<div className="flex justify-center py-8">
				<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (activities.length === 0) {
		return (
			<div className="text-center py-8 px-4">
				<Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
				<p className="text-xs text-muted-foreground">No activity yet</p>
			</div>
		);
	}

	return (
		<div className="divide-y">
			{activities.slice(0, 10).map((activity, index) => (
				<div key={index} className="p-3 hover:bg-muted/50 transition-colors">
					<div className="flex items-start gap-2">
						<div className="flex-shrink-0 mt-1">
							{'Comment' in activity.activity_type ? (
								<MessageSquare className="h-3 w-3 text-blue-500" />
							) : 'Reaction' in activity.activity_type ? (
								<ThumbsUp className="h-3 w-3 text-green-500" />
							) : (
								<User2 className="h-3 w-3 text-gray-500" />
							)}
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-xs font-medium">
								{'Comment' in activity.activity_type ? (
									'Commented'
								) : 'Reaction' in activity.activity_type ? (
									'Liked'
								) : (
									'Activity'
								)}
							</p>
							{'Comment' in activity.activity_type && (
								<p className="text-xs text-muted-foreground truncate mt-1">
									"{activity.activity_type.Comment}"
								</p>
							)}
							<p className="text-xs text-muted-foreground mt-1">
								{new Date(Number(activity.created_at) / 1000000).toLocaleDateString('en-US', {
									month: 'short',
									day: 'numeric'
								})}
							</p>
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

// Activity Feed Component (Full version - kept for compatibility)
const ActivityFeed: React.FC<{ userPrincipal: string }> = ({ userPrincipal }) => {
	const { actor } = useDialectica();
	const [activities, setActivities] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	React.useEffect(() => {
		const fetchActivities = async () => {
			if (!actor) return;

			try {
				const result = await actor.get_user_activities(
					Principal.fromText(userPrincipal)
				);
				
				if ('Ok' in result) {
					setActivities(result.Ok);
				}
			} catch (error) {
				console.error('Failed to fetch activities:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchActivities();
	}, [userPrincipal, actor]);

	if (loading) {
		return (
			<div className="flex justify-center py-12">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (activities.length === 0) {
		return (
			<Card>
				<CardContent className="text-center py-12">
					<Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
					<h3 className="text-lg font-roboto-condensed font-semibold mb-2">No Recent Activity</h3>
					<p className="text-muted-foreground">
						This user hasn't been active recently
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-3">
			{activities.slice(0, 15).map((activity, index) => (
				<Card key={index} className="transition-all hover:shadow-md">
					<CardContent className="p-4">
						<div className="flex items-start gap-3">
							<div className="flex-shrink-0 mt-1">
								{'Comment' in activity.activity_type ? (
									<div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
										<MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
									</div>
								) : 'Reaction' in activity.activity_type ? (
									<div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
										<ThumbsUp className="h-4 w-4 text-green-600 dark:text-green-400" />
									</div>
								) : (
									<div className="h-8 w-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
										<User2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
									</div>
								)}
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 mb-1">
									<span className="font-roboto-condensed font-medium text-sm">
										{'Comment' in activity.activity_type ? (
											'Left a comment'
										) : 'Reaction' in activity.activity_type ? (
											'Liked a post'
										) : (
											'Activity'
										)}
									</span>
								</div>
								{'Comment' in activity.activity_type && (
									<p className="text-sm text-muted-foreground bg-muted/50 rounded p-2 mt-2">
										"{activity.activity_type.Comment}"
									</p>
								)}
								<p className="text-xs text-muted-foreground mt-2 font-mono">
									{new Date(Number(activity.created_at) / 1000000).toLocaleDateString('en-US', {
										month: 'short',
										day: 'numeric',
										hour: '2-digit',
										minute: '2-digit'
									})}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
};

export default ProfilePage;