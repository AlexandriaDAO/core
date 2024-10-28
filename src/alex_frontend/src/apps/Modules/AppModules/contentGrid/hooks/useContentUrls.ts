import { useState, useRef, useCallback, useEffect } from 'react';
import { Transaction } from "@/apps/Modules/shared/types/queries";
import { ContentUrlInfo } from '../types';
import { createContentTypeHandlers, ContentTypeHandlerMap } from '../utils/contentTypeHandlers';

export const useContentUrls = (transactions: Transaction[], contentData: any) => {
  const [contentUrls, setContentUrls] = useState<Record<string, ContentUrlInfo>>({});
  const fetchPromises = useRef<Record<string, Promise<ContentUrlInfo>>>({});
  const contentTypeHandlers = useCallback((): ContentTypeHandlerMap => createContentTypeHandlers(contentData), [contentData]);

  const fetchContentUrls = useCallback(async () => {
    const newUrls: Record<string, ContentUrlInfo> = {};
    
    for (const transaction of transactions) {
      if (!fetchPromises.current[transaction.id] && !contentUrls[transaction.id]) {
        const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || "application/epub+zip";
        const handlers = contentTypeHandlers();
        
        // Find the matching handler based on content type
        const handler = Object.entries(handlers).find(([key]) => 
          contentType.startsWith(key) || contentType === key
        )?.[1];
        
        if (handler) {
          fetchPromises.current[transaction.id] = handler(transaction.id);
          newUrls[transaction.id] = await fetchPromises.current[transaction.id];
        }
      }
    }

    if (Object.keys(newUrls).length > 0) {
      setContentUrls(prev => ({...prev, ...newUrls}));
    }
  }, [transactions, contentTypeHandlers]);

  useEffect(() => {
    fetchContentUrls();
  }, [fetchContentUrls]);

  return contentUrls;
};
