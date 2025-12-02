import React, { useState } from "react";
import { Plus, Edit } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Link } from "@tanstack/react-router";
import PostFeed from "../components/PostFeed";
import { useAppSelector } from "@/store/hooks/useAppSelector";

const HomePage: React.FC = () => {
	const [feedKey, setFeedKey] = useState(0); // Force feed refresh
	const { user } = useAppSelector((state) => state.auth);

	return (
		<div className="max-w-4xl mx-auto">
			<div className="space-y-6">
				{/* Welcome message for non-authenticated users */}
				{!user && (
					<div className="text-center py-8 border-b">
						<h2 className="text-xl font-semibold mb-4">
							Welcome to Dialectica
						</h2>
						<p className="text-muted-foreground mb-6">
							A decentralized social platform where your posts are stored on Arweave
							and minted as NFTs on the Internet Computer.
						</p>
						<Button 
							variant="outline"
							onClick={() => window.location.href = '/auth'}
						>
							<Edit className="h-4 w-4 mr-2" />
							Sign In to Create Posts
						</Button>
					</div>
				)}

				{/* Posts Feed - Always visible */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold">Recent Posts</h2>
						{user && (
							<Button asChild scale="sm" className="gap-2">
								<Link to="/create">
									<Plus className="h-4 w-4" />
									Create Post
								</Link>
							</Button>
						)}
					</div>
					<PostFeed key={feedKey} />
				</div>
			</div>
		</div>
	);
};

export default HomePage;
