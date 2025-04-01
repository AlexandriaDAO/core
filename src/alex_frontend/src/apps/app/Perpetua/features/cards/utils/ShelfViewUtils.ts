import { Item } from "@/../../declarations/perpetua/perpetua.did";

// Type guard functions for safely checking content types
export const isMarkdownContentSafe = (content: any): boolean => {
  return content && typeof content === 'object' && 'Markdown' in content;
};

export const isShelfContentSafe = (content: any): boolean => {
  return content && typeof content === 'object' && 'Shelf' in content;
};

export const isNftContentSafe = (content: any): boolean => {
  return content && typeof content === 'object' && 'Nft' in content;
};

export const getNftContentSafe = (content: any): string | null => {
  return content && typeof content === 'object' && 'Nft' in content ? content.Nft : null;
};

export const getMarkdownContentSafe = (content: any): string => {
  return content && typeof content === 'object' && 'Markdown' in content ? content.Markdown : '';
};

// Function to find an item by its ID
export const findItemById = (items: [number, Item][], itemId: number) => {
  return items.find(([key, _]) => key === itemId);
};

// Generate URLs for content viewing
export const generateContentUrls = (content: any) => {
  const nftId = getNftContentSafe(content);
  
  return {
    fullUrl: nftId 
      ? `https://arweave.net/${nftId}` 
      : isMarkdownContentSafe(content)
        ? `data:text/markdown;charset=utf-8,${encodeURIComponent(getMarkdownContentSafe(content))}`
        : `data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(content || {}, null, 2))}`,
    coverUrl: null,
    thumbnailUrl: null
  };
}; 