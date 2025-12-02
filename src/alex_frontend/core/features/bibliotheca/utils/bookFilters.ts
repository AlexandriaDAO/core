// Utility functions for filtering book content in Bibliotheca

// Check if a content type is a book MIME type
export const isBookContentType = (contentType: string): boolean => {
  if (!contentType || typeof contentType !== 'string') {
    return false;
  }
  
  // Normalize the content type by removing charset and other parameters
  const normalizedType = contentType.toLowerCase().split(';')[0].trim();
  
  // Check for book MIME types
  return SUPPORTED_BOOK_TYPES.includes(normalizedType as any);
};

// EPUB MIME types - handle various formats
export const SUPPORTED_BOOK_TYPES = [
  'application/epub+zip',
  'application/epub zip',  // Handle space instead of +
  'application/epub',      // Handle partial matches
] as const;

// Check if content type is in our supported list
export const isSupportedBookType = (contentType: string): boolean => {
  if (!contentType) return false;
  
  const normalizedType = contentType.toLowerCase().split(';')[0].trim();
  return SUPPORTED_BOOK_TYPES.includes(normalizedType as any);
};

// Extract book type for display
export const getDisplayBookType = (contentType: string): string => {
  if (!contentType) return 'unknown';
  
  const normalizedType = contentType.toLowerCase().split(';')[0].trim();
  
  // Check for EPUB variants
  if (normalizedType.includes('epub')) {
    return 'EPUB';
  }
  
  return 'Unknown';
};

// Check if transaction data indicates book content
export const isBookTransaction = (transaction: any): boolean => {
  // Check various possible fields where content type might be stored
  if (transaction?.contentType) {
    return isBookContentType(transaction.contentType);
  }
  
  if (transaction?.content_type) {
    return isBookContentType(transaction.content_type);
  }
  
  if (transaction?.type) {
    return isBookContentType(transaction.type);
  }
  
  // Check tags if available (common in Arweave transactions)
  if (transaction?.tags) {
    const contentTypeTag = transaction.tags.find((tag: any) => 
      tag.name?.toLowerCase() === 'content-type'
    );
    if (contentTypeTag?.value) {
      return isBookContentType(contentTypeTag.value);
    }
  }
  
  // Check metadata if available
  if (transaction?.metadata?.contentType) {
    return isBookContentType(transaction.metadata.contentType);
  }
  
  return false;
};

// Filter array of transactions/NFTs for book content
export const filterBookItems = <T extends Record<string, any>>(
  items: T[], 
  getContentType?: (item: T) => string
): T[] => {
  return items.filter(item => {
    if (getContentType) {
      return isBookContentType(getContentType(item));
    }
    return isBookTransaction(item);
  });
};