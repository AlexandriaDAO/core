import React, { useEffect, useRef } from 'react';
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

interface SandboxRendererProps {
  transaction: Transaction;
  content: any;
  inModal?: boolean;
  contentUrls: ContentUrlInfo;
  showStats?: boolean;
  handleRenderError: (id: string) => void;
}

const SandboxRenderer: React.FC<SandboxRendererProps> = ({
  transaction,
  content,
  inModal = false,
  contentUrls,
  showStats = false,
  handleRenderError,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || "application/epub+zip";

  const hasError = !content || content.error;
  if (hasError) {
    return (
      <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center gap-4">
        <File className="text-gray-500 text-4xl" />
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  const commonProps = {
    className: `${inModal ? 'w-full h-full sm:object-cover xs:object-fill rounded-xl' : 'absolute inset-0 w-full h-full object-cover'}`,
    onError: () => handleRenderError(transaction.id),
  };

  const renderContent = () => {
    // Helper function to format JSON content
    const formatJSON = (content: string) => {
      try {
        const parsed = JSON.parse(content);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return content;
      }
    };

    if (contentType === "application/epub+zip") {
      if (inModal) {
        return (
          <ReaderProvider>
            <div className="h-[85vh] w-[800px] max-w-[95vw]">
              <Reader bookUrl={contentUrls.fullUrl} />
            </div>
          </ReaderProvider>
        );
      }
      return (
        <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
          {contentUrls.thumbnailUrl ? (
            <AspectRatio ratio={1}>
              <img src={contentUrls.thumbnailUrl} alt="Book cover" {...commonProps} crossOrigin="anonymous" />
            </AspectRatio>
          ) : (
            <>
              <BookOpen className="text-gray-500 text-4xl absolute" />
              <Skeleton className="h-8 w-32" />
            </>
          )}
        </div>
      );
    }

    const contentMap = {
      "audio/": (
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
                src={contentUrls.fullUrl}
                controls
                className="w-full relative z-30"
                onError={() => handleRenderError(transaction.id)}
                crossOrigin="anonymous"
              />
            </div>
          </AspectRatio>
        </div>
      ),
      "video/": (
        <div className="relative w-full h-full">
          {inModal ? (
            <div className="flex items-center justify-center">
              <video 
                src={contentUrls.fullUrl}
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
              {content?.thumbnailUrl ? (
                <>
                  <AspectRatio ratio={1}>
                    <img
                      src={content.thumbnailUrl}
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
      "image/": (
        inModal ? (
          <div className="flex items-center justify-center">
            <img 
              src={content?.imageObjectUrl || contentUrls.thumbnailUrl || contentUrls.fullUrl} 
              alt="Content" 
              decoding="async"
              className={`max-w-[95vw] max-h-[90vh] w-auto h-auto object-contain `}
              crossOrigin="anonymous" 
              onError={() => handleRenderError(transaction.id)}
            />
          </div>
        ) : (
          <AspectRatio ratio={1}>
            <img 
              src={content?.imageObjectUrl || contentUrls.thumbnailUrl || contentUrls.fullUrl} 
              alt="Content" 
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
              crossOrigin="anonymous" 
              onError={() => handleRenderError(transaction.id)}
            />
          </AspectRatio>
        )
      ),
      "text/html": (
        <div className={`w-full h-full ${inModal ? 'w-[800px] max-w-[95vw] max-h-[90vh] overflow-auto bg-white p-6' : 'bg-gray-200'}`}>
          <iframe
            ref={iframeRef}
            sandbox="allow-same-origin"
            className="w-full h-full"
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body {
                      margin: 0;
                      padding: 0;
                      color: rgb(31 41 55);
                      line-height: 1.5;
                      font-family: system-ui, -apple-system, sans-serif;
                    }
                    .prose {
                      max-width: none;
                      font-size: 0.875rem;
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
                  </style>
                </head>
                <body>
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
                      USE_PROFILES: {html: true},
                      SANITIZE_NAMED_PROPS: true,
                      IN_PLACE: false
                    })}
                  </div>
                  ${!inModal ? '<div style="position: absolute; inset: 0; background: linear-gradient(to bottom, transparent, transparent, rgb(229 231 235));"></div>' : ''}
                </body>
              </html>
            `}
          />
        </div>
      ),
      "text/markdown": (
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
      "application/pdf": (
        <div className={`relative w-full h-full flex items-center justify-center ${!inModal && 'bg-gray-200'}`}>
          {inModal ? (
            <div className="w-[800px] max-w-[95vw] h-[90vh]">
              <iframe
                src={`${contentUrls.fullUrl}#view=FitH`}
                className="w-full h-full"
                sandbox="allow-scripts allow-same-origin"
                title="PDF Viewer"
              />
            </div>
          ) : (
            <div className="relative w-full h-full">
              {contentUrls.thumbnailUrl || content?.thumbnailUrl ? (
                <AspectRatio ratio={1}>
                  <img
                    src={contentUrls.thumbnailUrl || content?.thumbnailUrl}
                    alt="PDF thumbnail"
                    className="w-full h-full object-cover rounded-lg"
                    crossOrigin="anonymous"
                  />
                </AspectRatio>
              ) : (
                <AspectRatio ratio={1}>
                  <div className="relative w-full h-full">
                    <iframe
                      src={`${contentUrls.fullUrl}#page=1&view=FitH&zoom=50&toolbar=0&navpanes=0`}
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
      "text/plain": (
        <div className={`w-full h-full ${inModal ? 'p-8 overflow-auto bg-background' : 'bg-background'}`}>
          {inModal ? (
            <div className="font-mono text-sm text-foreground whitespace-pre-wrap break-words">
              {content?.textContent}
            </div>
          ) : (
            <AspectRatio ratio={1}>
              <div className="w-full h-full p-4 flex flex-col">
                <div className="w-full h-full overflow-hidden relative">
                  <div className="font-mono text-sm text-foreground whitespace-pre-wrap break-words">
                    {content?.textContent}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
                </div>
              </div>
            </AspectRatio>
          )}
        </div>
      ),
      "application/json": (
        <div className={`w-full h-full ${inModal ? 'p-8 overflow-auto bg-background' : 'bg-background'}`}>
          {inModal ? (
            <div className="font-mono text-sm text-foreground whitespace-pre-wrap break-words">
              {formatJSON(content?.textContent)}
            </div>
          ) : (
            <AspectRatio ratio={1}>
              <div className="w-full h-full p-4 flex flex-col">
                <div className="w-full h-full overflow-hidden relative">
                  <div className="font-mono text-sm text-foreground whitespace-pre-wrap break-words">
                    {formatJSON(content?.textContent)}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
                </div>
              </div>
            </AspectRatio>
          )}
        </div>
      ),
      "text/csv": (
        <div className={`w-full h-full ${inModal ? 'p-8 overflow-auto bg-background' : 'bg-background'}`}>
          {inModal ? (
            <div className="font-mono text-sm text-foreground whitespace-pre-wrap break-words">
              {content?.textContent}
            </div>
          ) : (
            <AspectRatio ratio={1}>
              <div className="w-full h-full p-4 flex flex-col">
                <div className="w-full h-full overflow-hidden relative">
                  <div className="font-mono text-sm text-foreground whitespace-pre-wrap break-words">
                    {content?.textContent}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
                </div>
              </div>
            </AspectRatio>
          )}
        </div>
      ),
      "text/xml": (
        <div className={`w-full h-full ${inModal ? 'p-8 overflow-auto bg-background' : 'bg-background'}`}>
          {inModal ? (
            <div className="font-mono text-sm text-foreground whitespace-pre-wrap break-words">
              {content?.textContent}
            </div>
          ) : (
            <AspectRatio ratio={1}>
              <div className="w-full h-full p-4 flex flex-col">
                <div className="w-full h-full overflow-hidden relative">
                  <div className="font-mono text-sm text-foreground whitespace-pre-wrap break-words">
                    {content?.textContent}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
                </div>
              </div>
            </AspectRatio>
          )}
        </div>
      ),
      "application/x-yaml": (
        <div className={`w-full h-full ${inModal ? 'p-8 overflow-auto bg-background' : 'bg-background'}`}>
          {inModal ? (
            <div className="font-mono text-sm text-foreground whitespace-pre-wrap break-words">
              {content?.textContent}
            </div>
          ) : (
            <AspectRatio ratio={1}>
              <div className="w-full h-full p-4 flex flex-col">
                <div className="w-full h-full overflow-hidden relative">
                  <div className="font-mono text-sm text-foreground whitespace-pre-wrap break-words">
                    {content?.textContent}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
                </div>
              </div>
            </AspectRatio>
          )}
        </div>
      ),
    };

    return Object.entries(contentMap).find(([key]) => contentType.startsWith(key))?.[1] || (
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

export default React.memo(SandboxRenderer);
