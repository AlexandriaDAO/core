// Utility functions for filtering audio content in Sonora

// Check if a content type is an audio MIME type
export const isAudioContentType = (contentType: string): boolean => {
  if (!contentType || typeof contentType !== 'string') {
    return false;
  }
  
  // Normalize the content type by removing charset and other parameters
  const normalizedType = contentType.toLowerCase().split(';')[0].trim();
  
  // Check for audio MIME types
  return normalizedType.startsWith('audio/');
};

// Common audio MIME types we support
export const SUPPORTED_AUDIO_TYPES = [
  'audio/mp3',
  'audio/mpeg',
  'audio/wav',
  'audio/wave',
  'audio/webm',
  'audio/ogg',
  'audio/aac',
  'audio/flac',
  'audio/m4a',
  'audio/mp4',
  'audio/x-wav',
  'audio/x-mpeg',
  'audio/x-mp3',
] as const;

// Check if content type is in our supported list
export const isSupportedAudioType = (contentType: string): boolean => {
  if (!contentType) return false;
  
  const normalizedType = contentType.toLowerCase().split(';')[0].trim();
  return SUPPORTED_AUDIO_TYPES.includes(normalizedType as any);
};

// Extract audio type for display (remove 'audio/' prefix)
export const getDisplayAudioType = (contentType: string): string => {
  if (!contentType) return 'unknown';
  
  const normalizedType = contentType.toLowerCase().split(';')[0].trim();
  if (normalizedType.startsWith('audio/')) {
    return normalizedType.replace('audio/', '');
  }
  
  return normalizedType;
};

// Check if transaction data indicates audio content
export const isAudioTransaction = (transaction: any): boolean => {
  // Check various possible fields where content type might be stored
  if (transaction?.contentType) {
    return isAudioContentType(transaction.contentType);
  }
  
  if (transaction?.content_type) {
    return isAudioContentType(transaction.content_type);
  }
  
  if (transaction?.type) {
    return isAudioContentType(transaction.type);
  }
  
  // Check tags if available (common in Arweave transactions)
  if (transaction?.tags) {
    const contentTypeTag = transaction.tags.find((tag: any) => 
      tag.name?.toLowerCase() === 'content-type'
    );
    if (contentTypeTag?.value) {
      return isAudioContentType(contentTypeTag.value);
    }
  }
  
  // Check metadata if available
  if (transaction?.metadata?.contentType) {
    return isAudioContentType(transaction.metadata.contentType);
  }
  
  return false;
};

// Filter array of transactions/NFTs for audio content
export const filterAudioItems = <T extends Record<string, any>>(
  items: T[], 
  getContentType?: (item: T) => string
): T[] => {
  return items.filter(item => {
    if (getContentType) {
      return isAudioContentType(getContentType(item));
    }
    return isAudioTransaction(item);
  });
};