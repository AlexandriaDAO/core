/**
 * Post data structure stored on Arweave as JSON
 */
export interface PostData {
	/** Text content of the post */
	content: string;
	/** Unix timestamp in milliseconds when the post was created */
	createdAt: number;
	/** Optional Arweave transaction ID of attached media */
	mediaArweaveId?: string;
	/** MIME type of the attached media */
	mediaType?: string;
	/** Original filename of the media */
	mediaFilename?: string;
	/** Version of the post format */
	version: string;
}

/**
 * Application name tag used for filtering Dialectica posts
 */
export const APPLICATION_NAME = "Dialectica";

/**
 * Current post format version
 */
export const POST_VERSION = "1.0";
