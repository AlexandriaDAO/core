import React from "react";
import { useParams, Link } from "@tanstack/react-router";
import { ArrowLeft, User, FileText } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Card, CardContent } from "@/lib/components/card";
import UsernameBadge from "@/components/UsernameBadge";
import ArticleFeed from "../components/ArticleFeed";

const AuthorPage: React.FC = () => {
	const { principal } = useParams({ from: "/author/$principal" });

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Back Navigation */}
			<Button variant="ghost" className="mb-6" asChild>
				<Link to="/">
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back
				</Link>
			</Button>

			{/* Author Header */}
			<Card className="mb-8">
				<CardContent className="p-6">
					<div className="flex items-center gap-4">
						<div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
							<User className="h-8 w-8 text-primary" />
						</div>
						<div>
							<div className="mb-2">
								<UsernameBadge principal={principal} />
							</div>
							<p className="text-sm text-muted-foreground font-mono">
								{principal}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Articles Header */}
			<div className="flex items-center gap-2 mb-6">
				<FileText className="h-5 w-5" />
				<h2 className="text-2xl font-bold">Articles by this Author</h2>
			</div>

			{/* Author's Articles */}
			<ArticleFeed userPrincipal={principal} />
		</div>
	);
};

export default AuthorPage;
