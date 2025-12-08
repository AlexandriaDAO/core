import React, { useState } from "react";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { X, Tag, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/card";
import { Skeleton } from "@/lib/components/skeleton";
import ArticleFeed from "../components/ArticleFeed";
import { usePopularTags } from "../hooks/usePopularTags";

const BrowsePage: React.FC = () => {
	const search = useSearch({ from: "/browse" });
	const navigate = useNavigate();
	const [activeTag, setActiveTag] = useState<string | null>(
		(search as any)?.tag || null
	);
	const { tags: popularTags, loading: tagsLoading } = usePopularTags();

	const handleTagClick = (tag: string) => {
		if (activeTag === tag) {
			setActiveTag(null);
			navigate({ to: "/browse" });
		} else {
			setActiveTag(tag);
			navigate({ to: "/browse", search: { tag } });
		}
	};

	const clearFilter = () => {
		setActiveTag(null);
		navigate({ to: "/browse" });
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
				{/* Sidebar */}
				<aside className="lg:col-span-1">
					<div className="sticky top-4 space-y-6">
						{/* Popular Tags */}
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-lg flex items-center gap-2">
									<TrendingUp className="h-5 w-5" />
									Popular Tags
								</CardTitle>
							</CardHeader>
							<CardContent>
								{tagsLoading ? (
									<div className="flex flex-wrap gap-2">
										{[...Array(6)].map((_, i) => (
											<Skeleton key={i} className="h-7 w-16 rounded-full" />
										))}
									</div>
								) : popularTags.length > 0 ? (
									<div className="flex flex-wrap gap-2">
										{popularTags.map(({ tag, count }) => (
											<button
												key={tag}
												onClick={() => handleTagClick(tag)}
												className={`px-3 py-1 text-sm rounded-full transition-colors flex items-center gap-1.5 ${
													activeTag === tag
														? "bg-primary text-primary-foreground"
														: "bg-muted hover:bg-muted/80"
												}`}
												title={`${count} article${count !== 1 ? 's' : ''}`}
											>
												#{tag}
												<span className={`text-xs ${
													activeTag === tag
														? "text-primary-foreground/70"
														: "text-muted-foreground"
												}`}>
													{count}
												</span>
											</button>
										))}
									</div>
								) : (
									<p className="text-sm text-muted-foreground text-center py-2">
										No tags found yet
									</p>
								)}
							</CardContent>
						</Card>

						{/* Info Card */}
						<Card>
							<CardContent className="p-4">
								<div className="flex items-start gap-3">
									<Tag className="h-5 w-5 text-primary mt-0.5" />
									<div>
										<p className="font-medium mb-1">Filter by Tags</p>
										<p className="text-sm text-muted-foreground">
											Click on any tag to filter articles. Click again to remove the filter.
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</aside>

				{/* Main Content */}
				<main className="lg:col-span-3">
					{/* Header with Active Filter */}
					<div className="mb-6">
						<h1 className="text-3xl font-bold mb-2">Browse Articles</h1>
						{activeTag ? (
							<div className="flex items-center gap-2">
								<span className="text-muted-foreground">
									Showing articles tagged with
								</span>
								<span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm">
									#{activeTag}
									<button
										onClick={clearFilter}
										className="hover:opacity-70 transition-opacity"
									>
										<X className="h-3 w-3" />
									</button>
								</span>
							</div>
						) : (
							<p className="text-muted-foreground">
								Explore all articles from our community
							</p>
						)}
					</div>

					{/* Article Feed */}
					<ArticleFeed
						filterTag={activeTag || undefined}
						pageSize={5}
						onTagClick={handleTagClick}
					/>
				</main>
			</div>
		</div>
	);
};

export default BrowsePage;
