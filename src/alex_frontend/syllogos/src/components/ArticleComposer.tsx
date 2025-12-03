import React, { useState, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { Send, Loader2, CheckCircle2, AlertCircle, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Card, CardContent } from "@/lib/components/card";
import { Progress } from "@/lib/components/progress";
import { Alert, AlertDescription, AlertTitle } from "@/lib/components/alert";
import { Separator } from "@/lib/components/separator";
import { useUploadAndMint } from "@/features/pinax/hooks/useUploadAndMint";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { toast } from "sonner";
import ArticleEditor from "./ArticleEditor";
import {
	ArticleData,
	validateArticle,
} from "../types/article";

const DRAFT_STORAGE_KEY = "syllogos_article_draft";

interface ArticleComposerProps {
	onArticlePublished?: (arweaveId: string) => void;
	className?: string;
}

const ArticleComposer: React.FC<ArticleComposerProps> = ({
	onArticlePublished,
	className = "",
}) => {
	const [articleData, setArticleData] = useState<{
		title: string;
		content: string;
		excerpt: string;
		tags: string[];
		wordCount: number;
		readTime: number;
	}>({
		title: "",
		content: "",
		excerpt: "",
		tags: [],
		wordCount: 0,
		readTime: 0,
	});
	const [validationErrors, setValidationErrors] = useState<string[]>([]);
	const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

	const { uploadAndMint, isProcessing, progress, uploading, minting, resetUpload } =
		useUploadAndMint();
	const { user } = useAppSelector((state) => state.auth);

	const handleDataChange = useCallback(
		(data: typeof articleData) => {
			setArticleData(data);
			if (validationErrors.length > 0) {
				setValidationErrors([]);
			}
		},
		[validationErrors.length]
	);

	const handlePublish = async () => {
		if (!user) {
			toast.error("Please sign in to publish articles");
			return;
		}

		const errors = validateArticle(articleData);
		if (errors.length > 0) {
			setValidationErrors(errors);
			toast.error("Please fix the validation errors");
			return;
		}

		setValidationErrors([]);
		setPublishSuccess(null);

		try {
			const article: ArticleData = {
				title: articleData.title.trim(),
				content: articleData.content.trim(),
				excerpt: articleData.excerpt.trim(),
				tags: articleData.tags,
				createdAt: Date.now(),
				wordCount: articleData.wordCount,
				readTime: articleData.readTime,
			};

			const articleJson = JSON.stringify(article, null, 2);
			const articleBlob = new Blob([articleJson], { type: "application/json" });
			const articleFile = new File(
				[articleBlob],
				`article-${Date.now()}.json`,
				{ type: "application/json" }
			);

			const transactionId = await uploadAndMint(articleFile, "Syllogos");

			if (transactionId) {
				setPublishSuccess(transactionId);
				toast.success("Article published successfully!");
				localStorage.removeItem(DRAFT_STORAGE_KEY);
				onArticlePublished?.(transactionId);
			}
		} catch (error: any) {
			console.error("Failed to publish article:", error);
			toast.error(error.message || "Failed to publish article");
		}
	};

	const handleReset = () => {
		resetUpload();
		setPublishSuccess(null);
		setValidationErrors([]);
	};

	// Not logged in state
	if (!user) {
		return (
			<Card className={className}>
				<CardContent className="p-12 text-center">
					<div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
						<FileText className="h-8 w-8 text-muted-foreground" />
					</div>
					<h3 className="text-lg font-semibold mb-2">Sign in to write</h3>
					<p className="text-muted-foreground text-sm">
						Please sign in to write and publish articles
					</p>
				</CardContent>
			</Card>
		);
	}

	// Success state
	if (publishSuccess) {
		return (
			<Card className={className}>
				<CardContent className="p-12 text-center space-y-6">
					<div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
						<CheckCircle2 className="h-10 w-10 text-green-500" />
					</div>

					<div>
						<h2 className="text-2xl font-bold mb-2">Article Published!</h2>
						<p className="text-muted-foreground">
							Your article has been permanently stored on Arweave and minted as an NFT.
						</p>
					</div>

					<Card className="bg-muted/50">
						<CardContent className="p-4">
							<p className="text-xs text-muted-foreground mb-1">Arweave Transaction ID</p>
							<code className="text-sm break-all font-mono">{publishSuccess}</code>
						</CardContent>
					</Card>

					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Button variant="outline" asChild>
							<Link to="/article/$arweaveId" params={{ arweaveId: publishSuccess }}>
								<FileText className="h-4 w-4 mr-2" />
								View Article
							</Link>
						</Button>
						<Button variant="outline" onClick={() => window.open(`https://arweave.net/${publishSuccess}`, "_blank")}>
							<ExternalLink className="h-4 w-4 mr-2" />
							View on Arweave
						</Button>
						<Button variant="outline" onClick={handleReset}>
							Write Another
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={className}>
			<CardContent className="p-6 space-y-6">
				{/* Validation Errors */}
				{validationErrors.length > 0 && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Please fix the following errors</AlertTitle>
						<AlertDescription>
							<ul className="list-disc list-inside mt-2 space-y-1">
								{validationErrors.map((error, index) => (
									<li key={index}>{error}</li>
								))}
							</ul>
						</AlertDescription>
					</Alert>
				)}

				{/* Article Editor */}
				<ArticleEditor onDataChange={handleDataChange} disabled={isProcessing} />

				{/* Publishing Progress */}
				{isProcessing && (
					<Card className="bg-muted/50">
						<CardContent className="p-4 space-y-3">
							<div className="flex items-center gap-3">
								<Loader2 className="h-5 w-5 animate-spin text-primary" />
								<span className="font-medium">
									{uploading
										? "Uploading to Arweave..."
										: minting
										? "Minting NFT..."
										: "Processing..."}
								</span>
							</div>
							{uploading && (
								<div className="space-y-2">
									<Progress value={progress} className="h-2" />
									<p className="text-xs text-muted-foreground text-right">
										{Math.round(progress)}% complete
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				)}

				<Separator />

				{/* Footer */}
				<div className="flex items-center justify-between">
					<div className="text-sm text-muted-foreground">
						{articleData.wordCount > 0 ? (
							<span>
								{articleData.wordCount.toLocaleString()} words · {articleData.readTime} min read
							</span>
						) : (
							<span>Start writing your article</span>
						)}
					</div>
					<Button
						onClick={handlePublish}
						disabled={
							isProcessing ||
							!articleData.title.trim() ||
							!articleData.content.trim()
						}
						className="min-w-[160px]"
					>
						{isProcessing ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Publishing...
							</>
						) : (
							<>
								<Send className="h-4 w-4 mr-2" />
								Publish Article
							</>
						)}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};

export default ArticleComposer;
