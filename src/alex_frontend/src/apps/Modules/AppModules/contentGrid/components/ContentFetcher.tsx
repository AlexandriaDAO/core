import React, { useRef, useEffect } from 'react';

interface ContentFetcherProps {
  contentUrl: string;
  contentType: string;
  imageObjectUrl: string | null;
  onLoad: (element: HTMLImageElement | HTMLVideoElement, thumbnailUrl?: string) => void;
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
          if (contentType.startsWith('video/')) {
            const video = contentRef.current as HTMLVideoElement;
            // Seek to first frame
            video.currentTime = 0;
            // Wait for seek to complete
            video.addEventListener('seeked', () => {
              const canvas = document.createElement('canvas');
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                // Convert to blob and create thumbnail URL
                canvas.toBlob((blob) => {
                  if (blob) {
                    const thumbnailUrl = URL.createObjectURL(blob);
                    onLoad(video, thumbnailUrl);
                  }
                }, 'image/jpeg');
              }
            }, { once: true });
          } else {
            onLoad(contentRef.current);
          }
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
  }, [contentRef.current, onLoad, contentType]);

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
