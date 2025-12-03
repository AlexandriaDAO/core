import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { PenSquare, FileText, Clock, Trash2 } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/card";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import UsernameBadge from "@/components/UsernameBadge";
import ArticleFeed from "../components/ArticleFeed";
import { ArticleDraft } from "../types/article";

const DRAFT_STORAGE_KEY = "syllogos_article_draft";

const ProfilePage: React.FC = () => {
	const { user } = useAppSelector((state) => state.auth);
	const [draft, setDraft] = useState<ArticleDraft | null>(null);

	useEffect(() => {
		const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
		if (savedDraft) {
			try {
				const parsed = JSON.parse(savedDraft);
				if (parsed.title || parsed.content) {
					setDraft(parsed);
				}
			} catch (e) {
				console.error("Failed to parse draft:", e);
			}
		}
	}, []);

	const clearDraft = () => {
		localStorage.removeItem(DRAFT_STORAGE_KEY);
		setDraft(null);
	};

	const formatDraftDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		});
	};

	if (!user) {
		return (
			<div className="container mx-auto px-4 py-16 text-center">
				<h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
				<p className="text-muted-foreground">
					Please sign in to view your profile
				</p>
			</div>
		);
	}

	const userPrincipal = user.principal;

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Profile Header */}
			<Card className="mb-8">
				<CardContent className="p-6">
					<div className="flex items-center justify-between flex-wrap gap-4">
						<div className="flex items-center gap-4">
							<div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
								{userPrincipal.substring(0, 2).toUpperCase()}
							</div>
							<div>
								<div className="w-fit">
									<UsernameBadge principal={userPrincipal} />
								</div>
								<p className="text-sm text-muted-foreground font-mono mt-1">
									{userPrincipal}
								</p>
							</div>
						</div>
						<Button asChild>
							<Link to="/write">
								<PenSquare className="h-4 w-4 mr-2" />
								Write Article
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Draft Recovery */}
			{draft && (draft.title || draft.content) && (
				<Card className="mb-8 border-yellow-500/50 bg-yellow-500/5">
					<CardHeader className="pb-3">
						<CardTitle className="text-lg flex items-center gap-2">
							<Clock className="h-5 w-5 text-yellow-500" />
							Unsaved Draft
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-start justify-between gap-4">
							<div className="flex-1 min-w-0">
								<h3 className="font-medium truncate">
									{draft.title || "Untitled Article"}
								</h3>
								<p className="text-sm text-muted-foreground line-clamp-2 mt-1">
									{draft.content?.substring(0, 150) || "No content yet"}
									{draft.content && draft.content.length > 150 ? "..." : ""}
								</p>
								<p className="text-xs text-muted-foreground mt-2">
									Last saved: {formatDraftDate(draft.lastSaved)}
								</p>
							</div>
							<div className="flex gap-2">
								<Button variant="outline" scale="sm" onClick={clearDraft}>
									<Trash2 className="h-4 w-4" />
								</Button>
								<Button scale="sm" asChild>
									<Link to="/write">Continue Editing</Link>
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* My Articles */}
			<div className="flex items-center gap-2 mb-6">
				<FileText className="h-5 w-5" />
				<h2 className="text-2xl font-bold">My Articles</h2>
			</div>

			<ArticleFeed userPrincipal={userPrincipal} />
		</div>
	);
};

export default ProfilePage;
