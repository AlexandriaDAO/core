import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { ContentUrlInfo } from '../types';

export const useContentUrls = () => {
  const contentData = useSelector((state: RootState) => state.contentDisplay.contentData);
  
  // Convert contentData to just the URLs format that consumers expect
  const contentUrls: Record<string, ContentUrlInfo> = {};
  Object.entries(contentData).forEach(([id, data]) => {
    if (data.urls) {
      contentUrls[id] = data.urls;
    }
  });

  return contentUrls;
};
