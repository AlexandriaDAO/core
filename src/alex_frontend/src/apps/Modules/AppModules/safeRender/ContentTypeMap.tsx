import React, { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { BookOpen, File, Play, Music } from 'lucide-react';
import { Reader } from "@/features/reader";
import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";
import { AspectRatio } from "@/lib/components/aspect-ratio";
import { Skeleton } from "@/lib/components/skeleton";
import { getFileIcon } from './fileIcons';
import { Transaction } from "@/apps/Modules/shared/types/queries";
import { ContentUrlInfo } from './types';
import ReactMarkdown from 'react-markdown';
import { useTheme } from "@/providers/ThemeProvider";

interface ContentTypeMapProps {
  transaction: Transaction;
  content: any;
  inModal?: boolean;
  contentUrls: ContentUrlInfo;
  handleRenderError: (id: string) => void;
}

type ContentRenderer = () => JSX.Element;

interface ContentMap {
  [key: string]: ContentRenderer;
}

interface TextBasedContentMap {
  [key: string]: boolean;
}

const formatJSON = (content: string) => {
  try {
    const parsed = JSON.parse(content);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return content;
  }
};
const generateVideoThumbnail = (videoUrl: string, callback: (thumbnail: string) => void) => {
  const video = document.createElement('video');
  video.src = videoUrl;
  video.crossOrigin = "anonymous";
  video.onloadeddata = () => {
    video.currentTime = 2;
  };
  video.onseeked = () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnailUrl = canvas.toDataURL('image/png');
      callback(thumbnailUrl);
    }
  };
};

export const ContentTypeMap: React.FC<ContentTypeMapProps> = ({
  transaction,
  content,
  inModal = false,
  contentUrls,
  handleRenderError,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { theme } = useTheme();
  const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || 'application/octet-stream';
  const { fullUrl, coverUrl, thumbnailUrl } = contentUrls;
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(null);

  // Handle blob URL cleanup
  useEffect(() => {
    if (fullUrl.startsWith('blob:')) {
      setBlobUrl(fullUrl);
      return () => {
        URL.revokeObjectURL(fullUrl);
      };
    } else {
      setBlobUrl(fullUrl);
    }

    if (contentType.includes("video/") && !thumbnailUrl) {
      generateVideoThumbnail(fullUrl, setGeneratedThumbnail);
    }
  }, [fullUrl]);

  const commonProps = {
    className: `${inModal ? 'w-full h-full sm:object-cover xs:object-fill rounded-xl' : 'absolute inset-0 w-full h-full object-cover'}`,
    onError: () => handleRenderError(transaction.id),
  };

  const renderTextBasedContent = () => (
    <div className={`w-full h-full ${inModal ? 'p-8 overflow-auto bg-background' : 'bg-background'}`}>
      {inModal ? (
        <div className="font-mono text-sm text-foreground whitespace-pre-wrap break-words">
          {contentType === "application/json" ? formatJSON(content?.textContent) : content?.textContent}
        </div>
      ) : (
        <AspectRatio ratio={1}>
          <div className="w-full h-full p-4 flex flex-col">
            <div className="w-full h-full overflow-hidden relative">
              <div className="font-mono text-sm text-foreground whitespace-pre-wrap break-words">
                {contentType === "application/json" ? formatJSON(content?.textContent) : content?.textContent}
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
            </div>
          </div>
        </AspectRatio>
      )}
    </div>
  );

  const contentMap: ContentMap = {
    "application/epub+zip": () => {
      if (inModal) {
        return (
          <ReaderProvider>
            <div className="h-[85vh] w-[800px] max-w-[95vw]">
              <Reader bookUrl={blobUrl || fullUrl} />
            </div>
          </ReaderProvider>
        );
      }
      return (
        <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
          {coverUrl ? (
            <AspectRatio ratio={1}>
              <img src={coverUrl} alt="Book cover" {...commonProps} crossOrigin="anonymous" />
            </AspectRatio>
          ) : (
            <>
              <BookOpen className="text-gray-500 text-4xl absolute" />
              <Skeleton className="h-8 w-32" />
            </>
          )}
        </div>
      );
    },
    "audio/": () => (
      <div className="relative w-full h-full">
        <AspectRatio ratio={1}>
          <div className={`w-full h-full bg-gray-200 flex flex-col items-center justify-center p-4 gap-4 ${inModal ? 'w-[400px]' : ''}`}>
            <div className="flex flex-col items-center gap-2">
              <Music className="text-gray-500 text-4xl" />
              <div className="text-sm text-gray-500 font-medium">
                {contentType.split('/')[1].toUpperCase()}
              </div>
            </div>
            <audio
              src={blobUrl || fullUrl}
              controls
              className="w-full relative z-30"
              onError={() => handleRenderError(transaction.id)}
              crossOrigin="anonymous"
            />
          </div>
        </AspectRatio>
      </div>
    ),
    "video/": () => (
      <div className="relative w-full h-full">
        {inModal ? (
          <div className="flex items-center justify-center">
            <video
              src={blobUrl || fullUrl}
              controls
              playsInline
              controlsList="nodownload"
              crossOrigin="anonymous"
              muted={false}
              preload="metadata"
              className="max-w-[95vw] max-h-[90vh] w-auto h-auto"
              onError={() => handleRenderError(transaction.id)}
            />
          </div>
        ) : (
          <div className="relative w-full h-full">
            {thumbnailUrl || generatedThumbnail ?  (
              <>
                <AspectRatio ratio={1}>
                  <img
                    src={ thumbnailUrl || generatedThumbnail || ''} 
                    alt="Video thumbnail"
                    {...commonProps}
                    crossOrigin="anonymous"
                  />
                </AspectRatio>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/50 rounded-full p-4 transform transition-transform hover:scale-110">
                    <Play className="w-12 h-12 text-white" fill="white" />
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Play className="text-gray-500 text-4xl" />
              </div>
            )}
          </div>
        )}
      </div>
    ),
    "image/": () => (
      inModal ? (
        <div className="flex items-center justify-center">
          <img
            src={blobUrl || fullUrl}
            alt="Content"
            decoding="async"
            className="max-w-[95vw] max-h-[90vh] w-auto h-auto object-contain"
            crossOrigin="anonymous"
            onError={() => handleRenderError(transaction.id)}
          />
        </div>
      ) : (
        <AspectRatio ratio={1}>
          <img
            src={blobUrl || fullUrl}
            alt="Content"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
            crossOrigin="anonymous"
            onError={() => handleRenderError(transaction.id)}
          />
        </AspectRatio>
      )
    ),
    "text/html": () => (
      <div className={`w-full h-full ${inModal ? 'w-[800px] max-w-[95vw] max-h-[90vh] overflow-auto bg-background' : 'bg-background'}`}>
        <iframe
          ref={iframeRef}
          sandbox="allow-same-origin"
          className="w-full h-full"
          srcDoc={`
            <!DOCTYPE html>
            <html class="${theme}">
              <head>
                <style>
                  :root {
                    --foreground: 213 31% 91%;
                    --background: 0 0% 9%;
                  }

                  :root.light {
                    --foreground: 222.2 47.4% 11.2%;
                    --background: 60 2% 95%;
                  }

                  html, body {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    height: 100%;
                    color: hsl(var(--foreground));
                    background: hsl(var(--background));
                    line-height: 1.5;
                    font-family: system-ui, -apple-system, sans-serif;
                  }

                  .container {
                    box-sizing: border-box;
                    width: 100%;
                    height: 100%;
                    padding: 1.5rem;
                    overflow-y: auto;
                  }

                  .prose {
                    max-width: none;
                    width: 100%;
                    font-size: 0.875rem;
                    color: hsl(var(--foreground));
                    margin: 0 auto;
                  }

                  .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6,
                  .prose ul, .prose ol, .prose li, .prose p {
                    color: hsl(var(--foreground));
                    margin-left: 0;
                    margin-right: 0;
                    width: 100%;
                    box-sizing: border-box;
                  }

                  .prose h1 { font-size: 2em; margin: 0.67em 0; }
                  .prose h2 { font-size: 1.5em; margin: 0.75em 0; }
                  .prose h3 { font-size: 1.17em; margin: 0.83em 0; }
                  .prose h4 { margin: 1.12em 0; }
                  .prose h5 { font-size: 0.83em; margin: 1.5em 0; }
                  .prose h6 { font-size: 0.75em; margin: 1.67em 0; }
                  .prose ul, .prose ol { padding-left: 2em; margin: 1em 0; }
                  .prose li { margin: 0.5em 0; }
                  .prose p { margin: 1em 0; }

                  .gradient-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to bottom, transparent, transparent, hsl(var(--background)));
                    pointer-events: none;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="prose">
                    ${DOMPurify.sanitize(content?.textContent, {
            ALLOWED_TAGS: [
              'p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
              'strong', 'em', 'b', 'i', 'u', 'strike',
              'ul', 'ol', 'li', 'br', 'hr'
            ],
            ALLOWED_ATTR: ['title'],
            ALLOW_DATA_ATTR: false,
            FORBID_TAGS: [
              'script', 'style', 'iframe', 'frame', 'object', 'embed', 'form',
              'base', 'link', 'meta', 'head', 'html', 'body', 'param', 'applet',
              'img', 'a', 'input', 'textarea', 'select', 'button', 'svg',
              'math', 'template'
            ],
            FORBID_ATTR: [
              'onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout',
              'onmouseenter', 'onmouseleave', 'onscroll', 'onsubmit', 'onreset',
              'onselect', 'onblur', 'onfocus', 'onchange', 'onkeydown', 'onkeypress',
              'onkeyup', 'ondrag', 'ondrop',
              'style', 'href', 'src', 'action', 'formaction', 'ping', 'target',
              'rel', 'srcdoc', 'sandbox', 'poster', 'preload', 'formtarget'
            ],
            ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
            RETURN_DOM_FRAGMENT: false,
            RETURN_DOM: false,
            SANITIZE_DOM: true,
            KEEP_CONTENT: true,
            WHOLE_DOCUMENT: false,
            FORCE_BODY: true,
            USE_PROFILES: { html: true },
            SANITIZE_NAMED_PROPS: true,
            IN_PLACE: false
          })}
                  </div>
                </div>
                ${!inModal ? '<div class="gradient-overlay"></div>' : ''}
              </body>
            </html>
          `}
        />
      </div>
    ),
    "text/markdown": () => (
      <div className={`w-full h-full ${inModal ? 'w-[800px] max-w-[95vw] max-h-[90vh] overflow-auto bg-background p-6' : 'bg-background'}`}>
        {inModal ? (
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{content?.textContent}</ReactMarkdown>
          </div>
        ) : (
          <AspectRatio ratio={1}>
            <div className="w-full h-full p-4 flex flex-col">
              <div className="w-full h-full overflow-hidden relative">
                <div className="text-sm text-foreground font-mono whitespace-pre-wrap break-words">
                  {content?.textContent}
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
              </div>
            </div>
          </AspectRatio>
        )}
      </div>
    ),
    "application/pdf": () => (
      <div className={`relative w-full h-full flex items-center justify-center ${!inModal && 'bg-gray-200'}`}>
        {inModal ? (
          <div className="w-[800px] max-w-[95vw] h-[90vh]">
            <iframe
              src={`${blobUrl || fullUrl}#view=FitH`}
              className="w-full h-full"
              sandbox="allow-scripts allow-same-origin"
              title="PDF Viewer"
            />
          </div>
        ) : (
          <div className="relative w-full h-full">
            {thumbnailUrl || content?.thumbnailUrl ? (
              <AspectRatio ratio={1}>
                <img
                  src={thumbnailUrl || content?.thumbnailUrl}
                  alt="PDF thumbnail"
                  className="w-full h-full object-cover rounded-lg"
                  crossOrigin="anonymous"
                />
              </AspectRatio>
            ) : (
              <AspectRatio ratio={1}>
                <div className="relative w-full h-full">
                  <iframe
                    src={`${blobUrl || fullUrl}#page=1&view=FitH&zoom=50&toolbar=0&navpanes=0`}
                    className="w-full h-full rounded-lg"
                    sandbox="allow-scripts allow-same-origin"
                    title="PDF Preview"
                    style={{
                      pointerEvents: 'none',
                      backgroundColor: 'rgb(243 244 246)'
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ pointerEvents: 'none' }}
                  />
                </div>
              </AspectRatio>
            )}
          </div>
        )}
      </div>
    ),
  };

  const textBasedContentMap: TextBasedContentMap = {
    "text/plain": true,
    "application/json": true,
    "text/csv": true,
    "text/xml": true,
    "application/x-yaml": true,
  };

  const renderContent = () => {
    // First check for exact content type match
    if (contentMap[contentType]) {
      return contentMap[contentType]();
    }

    // Then check for content type prefix match
    const matchingPrefix = Object.keys(contentMap).find(prefix => contentType.startsWith(prefix));
    if (matchingPrefix) {
      return contentMap[matchingPrefix]();
    }

    // Check for text-based content types
    if (textBasedContentMap[contentType]) {
      return renderTextBasedContent();
    }

    // Default fallback
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        {getFileIcon(contentType)}
      </div>
    );
  };

  return (
    <div className={`relative ${inModal ? 'w-full h-full' : 'w-full h-full'}`}>
      {renderContent()}
    </div>
  );
};
