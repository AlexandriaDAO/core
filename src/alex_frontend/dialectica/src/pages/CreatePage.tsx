import React from "react";
import { Edit3, FileText, Upload, Zap } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/lib/components/card";
import { useRouter } from "@tanstack/react-router";
import PostComposer from "../components/PostComposer";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import UsernameBadge from "@/components/UsernameBadge";

const CreatePage: React.FC = () => {
	const router = useRouter();
	const { user } = useAppSelector((state) => state.auth);

	const handlePostCreated = (arweaveId: string) => {
		// Navigate to the newly created post
		router.navigate({ to: "/post/$arweaveId", params: { arweaveId } });
	};

	if (!user) {
		return (
			<div className="max-w-4xl mx-auto py-8">
				<Card className="text-center">
					<CardContent className="p-12">
						<Edit3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
						<h1 className="text-2xl font-roboto-condensed font-semibold mb-4">Sign in Required</h1>
						<p className="text-muted-foreground">
							You need to sign in to create posts.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto space-y-8">
			{/* Header */}
			<div className="text-center space-y-4">
				<div className="flex items-center justify-center gap-3 mb-4">
					<div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
						<Edit3 className="h-6 w-6 text-primary" />
					</div>
					<h1 className="text-3xl font-roboto-condensed font-bold">Create Post</h1>
				</div>
				<p className="text-muted-foreground max-w-2xl mx-auto">
					Share your thoughts with the world. Your post will be permanently stored on Arweave and minted as an NFT.
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Main Content */}
				<div className="lg:col-span-2 space-y-6">
					{/* User Info */}
					<Card>
						<CardContent className="px-4 py-3">
							<div className="flex items-center gap-3">
								<span className="text-sm font-roboto-condensed text-muted-foreground">Posting as</span>
								<UsernameBadge principal={user.principal} />
							</div>
						</CardContent>
					</Card>

					{/* Post Composer */}
					<PostComposer onPostCreated={handlePostCreated} />
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Features */}
					<Card>
						<CardHeader>
							<h3 className="font-roboto-condensed font-semibold">Features</h3>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-start gap-3">
								<FileText className="h-5 w-5 text-blue-500 mt-0.5" />
								<div>
									<p className="text-sm font-medium">Text Posts</p>
									<p className="text-xs text-muted-foreground">Up to 2,000 characters</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<Upload className="h-5 w-5 text-green-500 mt-0.5" />
								<div>
									<p className="text-sm font-medium">Media Upload</p>
									<p className="text-xs text-muted-foreground">Images, videos, audio</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<Zap className="h-5 w-5 text-purple-500 mt-0.5" />
								<div>
									<p className="text-sm font-medium">NFT Minting</p>
									<p className="text-xs text-muted-foreground">Permanent ownership</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Tips */}
					<Card>
						<CardHeader>
							<h3 className="font-roboto-condensed font-semibold">💡 Pro Tips</h3>
						</CardHeader>
						<CardContent>
							<ul className="text-sm space-y-2 text-muted-foreground">
								<li className="flex items-start gap-2">
									<span className="text-primary">•</span>
									<span>Posts are stored permanently on Arweave</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-primary">•</span>
									<span>Each post becomes an NFT you own</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-primary">•</span>
									<span>Others can like, dislike, and comment</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-primary">•</span>
									<span>Content is immutable once posted</span>
								</li>
							</ul>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default CreatePage;
