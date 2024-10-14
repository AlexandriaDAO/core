import React, { useRef, useEffect } from 'react';

interface ContentFetcherProps {
  contentUrl: string;
  contentType: string;
  imageObjectUrl: string | null;
  onLoad: (element: HTMLImageElement | HTMLVideoElement) => void;
  onError: () => void;
}

const ContentFetcher: React.FC<ContentFetcherProps> = ({
  contentUrl,
  contentType,
  imageObjectUrl,
  onLoad,
  onError,
}) => {
  const contentRef = useRef<HTMLImageElement | HTMLVideoElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const handleLoad = () => {
        if (contentRef.current) {
          onLoad(contentRef.current);
        }
      };

      const currentContent = contentRef.current;

      currentContent.addEventListener('load', handleLoad);
      currentContent.addEventListener('loadedmetadata', handleLoad); // For videos

      return () => {
        currentContent.removeEventListener('load', handleLoad);
        currentContent.removeEventListener('loadedmetadata', handleLoad);
      };
    }
  }, [contentRef.current, onLoad]);

  return (
    <>
      {contentType.startsWith('image/') && imageObjectUrl && (
        <img
          ref={contentRef as React.RefObject<HTMLImageElement>}
          src={imageObjectUrl}
          alt="Content for validation"
          onError={onError}
          style={{ display: 'none' }}
        />
      )}
      {contentType.startsWith('video/') && (
        <video
          ref={contentRef as React.RefObject<HTMLVideoElement>}
          src={contentUrl}
          crossOrigin="anonymous"
          onError={onError}
          style={{ display: 'none' }}
        >
          <source src={contentUrl} type={contentType} />
        </video>
      )}
    </>
  );
};

export default ContentFetcher;
