import Epub from "epubjs";

export const getCover = async (url: string): Promise<string | null> => {
  try {
    const ebook = Epub(url, { openAs: "epub" });
    
    // Wait for the book to be loaded
    await new Promise((resolve) => {
      ebook.ready.then(resolve);
      // Add a timeout in case the book doesn't load properly
      setTimeout(resolve, 5000);
    });

    let coverUrl: string | null = null;
    try {
      coverUrl = await ebook.coverUrl();
    } catch (coverError) {
      console.warn("Error extracting cover from epub:", coverError);
    }

    // Attempt to destroy the ebook object
    try {
      ebook.destroy();
    } catch (destroyError) {
      console.warn("Error while destroying ebook object:", destroyError);
    }

    return coverUrl;
  } catch (error) {
    console.warn("Error processing epub:", error);
    return null;
  }
};