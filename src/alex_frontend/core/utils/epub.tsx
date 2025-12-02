import Epub from "epubjs";


export const getCover = async (url: string): Promise<string | null> => {
	let ebook: any = null;

	try {
		ebook = Epub(url, { openAs: "epub" });

		// Wait for the book to be ready without timeout race
		await ebook.ready;

		// Try to get cover URL
		const coverUrl = await ebook.coverUrl();
		
		// Return null if no cover is available (not an error)
		return coverUrl || null;
	} catch (error) {
		// Re-throw the error so SWR can handle it properly
		// This indicates an actual error (can't open book, network issues, etc.)
		throw new Error(`Unable to load book cover: ${error instanceof Error ? error.message : 'Unknown error'}`);
	} finally {
		// Ensure cleanup happens regardless of success/failure
		if (ebook) {
			try {
				ebook.destroy();
			} catch (destroyError) {
				console.warn(
					"Error while destroying ebook object:",
					destroyError
				);
			}
		}
	}
};
