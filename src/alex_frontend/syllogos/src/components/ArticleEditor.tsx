import React, { useState, useEffect, useCallback } from "react";
import { Eye, Edit3, X, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/lib/components/button";
import { Input } from "@/lib/components/input";
import { Textarea } from "@/lib/components/textarea";
import { Label } from "@/lib/components/label";
import { Badge } from "@/lib/components/badge";
import { Card, CardContent } from "@/lib/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/lib/components/tabs";
import { Separator } from "@/lib/components/separator";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import {
	ArticleDraft,
	ARTICLE_CONSTRAINTS,
	calculateWordCount,
	calculateReadTime,
	generateExcerpt,
} from "../types/article";

const DRAFT_STORAGE_KEY = "syllogos_article_draft";

interface ArticleEditorProps {
	onDataChange?: (data: {
		title: string;
		content: string;
		excerpt: string;
		tags: string[];
		wordCount: number;
		readTime: number;
	}) => void;
	disabled?: boolean;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({
	onDataChange,
	disabled = false,
}) => {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [excerpt, setExcerpt] = useState("");
	const [tagInput, setTagInput] = useState("");
	const [tags, setTags] = useState<string[]>([]);
	const [autoExcerpt, setAutoExcerpt] = useState(true);
	const [activeTab, setActiveTab] = useState("write");

	const wordCount = calculateWordCount(content);
	const readTime = calculateReadTime(wordCount);

	// Load draft from localStorage on mount
	useEffect(() => {
		const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
		if (savedDraft) {
			try {
				const draft: ArticleDraft = JSON.parse(savedDraft);
				setTitle(draft.title || "");
				setContent(draft.content || "");
				setExcerpt(draft.excerpt || "");
				setTags(draft.tags || []);
				if (draft.excerpt) {
					setAutoExcerpt(false);
				}
			} catch (e) {
				console.error("Failed to parse draft:", e);
			}
		}
	}, []);

	// Auto-save draft to localStorage
	useEffect(() => {
		const draft: ArticleDraft = {
			title,
			content,
			excerpt,
			tags,
			lastSaved: Date.now(),
		};
		localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
	}, [title, content, excerpt, tags]);

	// Auto-generate excerpt from content
	useEffect(() => {
		if (autoExcerpt && content) {
			setExcerpt(generateExcerpt(content));
		}
	}, [content, autoExcerpt]);

	// Notify parent of data changes
	useEffect(() => {
		onDataChange?.({
			title,
			content,
			excerpt,
			tags,
			wordCount,
			readTime,
		});
	}, [title, content, excerpt, tags, wordCount, readTime, onDataChange]);

	const handleAddTag = useCallback(() => {
		const trimmedTag = tagInput.trim().toLowerCase();
		if (
			trimmedTag &&
			!tags.includes(trimmedTag) &&
			tags.length < ARTICLE_CONSTRAINTS.MAX_TAGS &&
			trimmedTag.length <= ARTICLE_CONSTRAINTS.TAG_MAX_LENGTH
		) {
			setTags([...tags, trimmedTag]);
			setTagInput("");
		}
	}, [tagInput, tags]);

	const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			handleAddTag();
		}
	};

	const handleRemoveTag = (tagToRemove: string) => {
		setTags(tags.filter((tag) => tag !== tagToRemove));
	};

	const handleExcerptChange = (value: string) => {
		setExcerpt(value);
		setAutoExcerpt(false);
	};

	const clearDraft = () => {
		setTitle("");
		setContent("");
		setExcerpt("");
		setTags([]);
		setAutoExcerpt(true);
		localStorage.removeItem(DRAFT_STORAGE_KEY);
	};

	return (
		<div className="space-y-6">
			{/* Title */}
			<div className="space-y-2">
				<Label htmlFor="title" scale="sm" className="text-foreground">
					Title <span className="text-destructive">*</span>
				</Label>
				<Input
					id="title"
					placeholder="Enter your article title..."
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					maxLength={ARTICLE_CONSTRAINTS.TITLE_MAX_LENGTH}
					disabled={disabled}
					className="text-lg font-semibold h-12"
				/>
				<p className="text-xs text-muted-foreground text-right">
					{title.length}/{ARTICLE_CONSTRAINTS.TITLE_MAX_LENGTH}
				</p>
			</div>

			<Separator />

			{/* Content Editor with Tabs */}
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label scale="sm" className="text-foreground">
						Content <span className="text-destructive">*</span>
					</Label>
					<span className="text-xs text-muted-foreground">
						Markdown supported
					</span>
				</div>

				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full grid-cols-2 mb-4">
						<TabsTrigger value="write" disabled={disabled} className="gap-2">
							<Edit3 className="h-4 w-4" />
							Write
						</TabsTrigger>
						<TabsTrigger value="preview" disabled={disabled} className="gap-2">
							<Eye className="h-4 w-4" />
							Preview
						</TabsTrigger>
					</TabsList>

					<TabsContent value="write" className="mt-0">
						<Textarea
							placeholder="Write your article content in Markdown...

# Heading 1
## Heading 2

**Bold text** and *italic text*

- List item 1
- List item 2

> Blockquote

`inline code`"
							value={content}
							onChange={(e) => setContent(e.target.value)}
							maxLength={ARTICLE_CONSTRAINTS.CONTENT_MAX_LENGTH}
							disabled={disabled}
							className="min-h-[400px] font-mono text-sm resize-y"
						/>
					</TabsContent>

					<TabsContent value="preview" className="mt-0">
						<Card className="min-h-[400px]">
							<CardContent className="p-6">
								{content ? (
									<MarkdownRenderer content={content} />
								) : (
									<p className="text-muted-foreground italic text-center py-16">
										Start writing to see the preview...
									</p>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				<div className="flex justify-between text-xs text-muted-foreground">
					<span>
						{wordCount.toLocaleString()} words · {readTime} min read
					</span>
					<span>
						{content.length.toLocaleString()}/
						{ARTICLE_CONSTRAINTS.CONTENT_MAX_LENGTH.toLocaleString()} characters
					</span>
				</div>
			</div>

			<Separator />

			{/* Excerpt */}
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label htmlFor="excerpt" scale="sm" className="text-foreground">
						Excerpt <span className="text-destructive">*</span>
					</Label>
					{!autoExcerpt && (
						<Button
							variant="ghost"
							scale="sm"
							onClick={() => {
								setAutoExcerpt(true);
								setExcerpt(generateExcerpt(content));
							}}
							disabled={disabled}
							className="h-7 text-xs"
						>
							<RotateCcw className="h-3 w-3 mr-1" />
							Auto-generate
						</Button>
					)}
				</div>
				<p className="text-xs text-muted-foreground">
					A brief description shown in article cards
				</p>
				<Textarea
					id="excerpt"
					placeholder="A brief description of your article..."
					value={excerpt}
					onChange={(e) => handleExcerptChange(e.target.value)}
					maxLength={ARTICLE_CONSTRAINTS.EXCERPT_MAX_LENGTH}
					disabled={disabled}
					className="min-h-[80px] resize-none"
				/>
				<p className="text-xs text-muted-foreground text-right">
					{excerpt.length}/{ARTICLE_CONSTRAINTS.EXCERPT_MAX_LENGTH}
				</p>
			</div>

			<Separator />

			{/* Tags */}
			<div className="space-y-2">
				<Label scale="sm" className="text-foreground">
					Tags
				</Label>
				<p className="text-xs text-muted-foreground">
					Add up to {ARTICLE_CONSTRAINTS.MAX_TAGS} tags to help readers find your article
				</p>
				<div className="flex gap-2">
					<Input
						placeholder="Add a tag..."
						value={tagInput}
						onChange={(e) => setTagInput(e.target.value)}
						onKeyDown={handleTagInputKeyDown}
						maxLength={ARTICLE_CONSTRAINTS.TAG_MAX_LENGTH}
						disabled={disabled || tags.length >= ARTICLE_CONSTRAINTS.MAX_TAGS}
						className="flex-1"
					/>
					<Button
						variant="outline"
						onClick={handleAddTag}
						disabled={
							disabled ||
							!tagInput.trim() ||
							tags.length >= ARTICLE_CONSTRAINTS.MAX_TAGS
						}
					>
						<Plus className="h-4 w-4 mr-1" />
						Add
					</Button>
				</div>

				{tags.length > 0 && (
					<div className="flex flex-wrap gap-2 mt-3">
						{tags.map((tag) => (
							<Badge
								key={tag}
								variant="secondary"
								className="gap-1 pr-1"
							>
								#{tag}
								<button
									onClick={() => handleRemoveTag(tag)}
									disabled={disabled}
									className="ml-1 rounded-full hover:bg-destructive/20 hover:text-destructive p-0.5 transition-colors"
								>
									<X className="h-3 w-3" />
								</button>
							</Badge>
						))}
					</div>
				)}
			</div>

			<Separator />

			{/* Clear Draft */}
			<div className="flex justify-end">
				<Button
					variant="ghost"
					scale="sm"
					onClick={clearDraft}
					disabled={disabled || (!title && !content && !excerpt && tags.length === 0)}
					className="text-muted-foreground hover:text-destructive"
				>
					Clear Draft
				</Button>
			</div>
		</div>
	);
};

export default ArticleEditor;
