/**
 * Data structure stored on Arweave as JSON
 */
export interface ArticleData {
	title: string;           // max 100 chars
	content: string;         // markdown content, max 50000 chars
	excerpt: string;         // short description, max 280 chars
	tags: string[];          // max 5 tags
	coverImage?: string;     // optional arweave ID of cover image
	createdAt: number;       // unix timestamp in milliseconds
	wordCount: number;       // calculated word count
	readTime: number;        // estimated read time in minutes
}

/**
 * Full article with engagement data (used in UI)
 */
export interface Article extends ArticleData {
	arweaveId: string;       // arweave transaction ID
	author: string;          // principal ID of author
	likes: number;
	dislikes: number;
	comments: number;
	userLiked: boolean;
	userDisliked: boolean;
}

/**
 * Draft article stored in localStorage
 */
export interface ArticleDraft {
	title: string;
	content: string;
	excerpt: string;
	tags: string[];
	lastSaved: number;       // timestamp of last auto-save
}

/**
 * Article validation constraints
 */
export const ARTICLE_CONSTRAINTS = {
	TITLE_MAX_LENGTH: 100,
	CONTENT_MAX_LENGTH: 50000,
	EXCERPT_MAX_LENGTH: 280,
	MAX_TAGS: 5,
	TAG_MAX_LENGTH: 30,
	WORDS_PER_MINUTE: 200,   // average reading speed
} as const;

/**
 * Calculate word count from content
 */
export function calculateWordCount(content: string): number {
	return content
		.trim()
		.split(/\s+/)
		.filter((word) => word.length > 0).length;
}

/**
 * Calculate estimated read time in minutes
 */
export function calculateReadTime(wordCount: number): number {
	return Math.max(1, Math.ceil(wordCount / ARTICLE_CONSTRAINTS.WORDS_PER_MINUTE));
}

/**
 * Validate article data before publishing
 */
export function validateArticle(data: Partial<ArticleData>): string[] {
	const errors: string[] = [];

	if (!data.title?.trim()) {
		errors.push("Title is required");
	} else if (data.title.length > ARTICLE_CONSTRAINTS.TITLE_MAX_LENGTH) {
		errors.push(`Title must be ${ARTICLE_CONSTRAINTS.TITLE_MAX_LENGTH} characters or less`);
	}

	if (!data.content?.trim()) {
		errors.push("Content is required");
	} else if (data.content.length > ARTICLE_CONSTRAINTS.CONTENT_MAX_LENGTH) {
		errors.push(`Content must be ${ARTICLE_CONSTRAINTS.CONTENT_MAX_LENGTH} characters or less`);
	}

	if (!data.excerpt?.trim()) {
		errors.push("Excerpt is required");
	} else if (data.excerpt.length > ARTICLE_CONSTRAINTS.EXCERPT_MAX_LENGTH) {
		errors.push(`Excerpt must be ${ARTICLE_CONSTRAINTS.EXCERPT_MAX_LENGTH} characters or less`);
	}

	if (data.tags && data.tags.length > ARTICLE_CONSTRAINTS.MAX_TAGS) {
		errors.push(`Maximum ${ARTICLE_CONSTRAINTS.MAX_TAGS} tags allowed`);
	}

	if (data.tags) {
		const invalidTags = data.tags.filter(
			(tag) => tag.length > ARTICLE_CONSTRAINTS.TAG_MAX_LENGTH
		);
		if (invalidTags.length > 0) {
			errors.push(`Tags must be ${ARTICLE_CONSTRAINTS.TAG_MAX_LENGTH} characters or less`);
		}
	}

	return errors;
}

/**
 * Generate excerpt from content if not provided
 */
export function generateExcerpt(content: string, maxLength: number = ARTICLE_CONSTRAINTS.EXCERPT_MAX_LENGTH): string {
	// Remove markdown formatting for cleaner excerpt
	const plainText = content
		.replace(/#{1,6}\s/g, '')      // Remove headings
		.replace(/\*\*|__/g, '')        // Remove bold
		.replace(/\*|_/g, '')           // Remove italic
		.replace(/`{1,3}[^`]*`{1,3}/g, '') // Remove code
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
		.replace(/!\[[^\]]*\]\([^)]+\)/g, '') // Remove images
		.replace(/\n+/g, ' ')           // Replace newlines with spaces
		.trim();

	if (plainText.length <= maxLength) {
		return plainText;
	}

	// Truncate at word boundary
	const truncated = plainText.substring(0, maxLength);
	const lastSpace = truncated.lastIndexOf(' ');
	return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}
