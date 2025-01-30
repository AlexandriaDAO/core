import React from 'react';
import { BookOpen, File, Play, Code, Music } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import { Reader } from "@/features/reader";
import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";
import ContentValidator from './ContentValidator';
import { getFileIcon } from '@/apps/Modules/AppModules/safeRender/fileIcons';
import { Transaction } from "@/apps/Modules/shared/types/queries";
import { ContentUrlInfo, MintableState } from './types';
import { Progress } from "@/lib/components/progress";
import { Skeleton } from "@/lib/components/skeleton";
import { AspectRatio } from "@/lib/components/aspect-ratio";

interface ContentRendererProps {
  transaction: Transaction;
  content: any;
  inModal?: boolean;
  contentUrls: ContentUrlInfo;
  showStats: boolean;
  mintableState: MintableState;
  handleRenderError: (id: string) => void;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({
  transaction,
  content,
  inModal = false,
  contentUrls,
  showStats,
  mintableState,
  handleRenderError,
}) => {
  const contentType = transaction.tags.find(tag => tag.name === "Content-Type")?.value || "application/epub+zip";
  const mintableStateItem = mintableState[transaction.id];
  const isMintable = mintableStateItem?.mintable;
  const predictions = mintableStateItem?.predictions;

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
    if (contentType === "application/epub+zip") {
      if (inModal) {
        return (
          <ReaderProvider>
            <div className="h-full pt-8">
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
            <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center p-4 gap-4">
              <div className="flex flex-col items-center gap-2">
                <Music className="text-gray-500 text-4xl" />
                <div className="text-sm text-gray-500 font-medium">
                  {contentType.split('/')[1].toUpperCase()}
                </div>
              </div>
              <audio 
                src={contentUrls.fullUrl}
                controls
                className="w-full max-w-[200px] relative z-30"
                onError={() => handleRenderError(transaction.id)}
              />
            </div>
          </AspectRatio>
        </div>
      ),
      "video/": (
        <div className="relative w-full h-full">
          {inModal ? (
            <video 
              src={contentUrls.fullUrl}
              controls
              playsInline
              controlsList="nodownload"
              crossOrigin="anonymous"
              muted={false}
              preload="metadata"
              {...commonProps}
            />
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
        <AspectRatio ratio={1}>
          <img 
            src={content?.imageObjectUrl || contentUrls.thumbnailUrl || contentUrls.fullUrl} 
            alt="Content" 
            decoding="async"
            {...commonProps}
            crossOrigin="anonymous" 
          />
        </AspectRatio>
      ),
      "text/html": (
        <div className={`w-full h-full ${inModal ? 'p-8 overflow-auto bg-white' : 'bg-gray-200'}`}>
          {inModal ? (
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(content?.textContent, {
                  ALLOWED_TAGS: [
                    // Basic text formatting only
                    'p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                    'strong', 'em', 'b', 'i', 'u', 'strike',
                    'ul', 'ol', 'li',
                    'br', 'hr'
                  ],
                  ALLOWED_ATTR: [
                    // Extremely limited attributes
                    'title'
                  ],
                  ALLOW_DATA_ATTR: false,
                  ADD_TAGS: [],
                  ADD_ATTR: [],
                  FORBID_TAGS: [
                    'script', 'style', 'iframe', 'frame', 'object', 'embed', 'form',
                    'base', 'link', 'meta', 'head', 'html', 'body', 'param', 'applet',
                    'img', 'a', 'input', 'textarea', 'select', 'button', 'svg',
                    'math', 'template'
                  ],
                  FORBID_ATTR: [
                    // All event handlers
                    'onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 
                    'onmouseenter', 'onmouseleave', 'onscroll', 'onsubmit', 'onreset',
                    'onselect', 'onblur', 'onfocus', 'onchange', 'onkeydown', 'onkeypress',
                    'onkeyup', 'ondrag', 'ondrop',
                    // Dangerous attributes
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
                })
              }}
            />
          ) : (
            <AspectRatio ratio={1}>
              <div className="w-full h-full p-4 flex flex-col">
                <div className="w-full h-full overflow-hidden relative">
                  <div className="text-sm text-gray-700">
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: DOMPurify.sanitize(content?.textContent, {
                          // Same config as above
                          ALLOWED_TAGS: [
                            'p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                            'strong', 'em', 'b', 'i', 'u', 'strike',
                            'ul', 'ol', 'li', 'br', 'hr'
                          ],
                          ALLOWED_ATTR: ['title'],
                          // Rest of the config same as above but without images/links in preview
                          ALLOW_DATA_ATTR: false,
                          FORBID_TAGS: [
                            'script', 'style', 'iframe', 'frame', 'object', 'embed', 'form',
                            'base', 'link', 'meta', 'head', 'html', 'body', 'param', 'applet'
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
                        })
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-200" />
                </div>
              </div>
            </AspectRatio>
          )}
        </div>
      ),
      "text/markdown": (
        <div className={`w-full h-full ${inModal ? 'p-8 overflow-auto bg-white' : 'bg-gray-200'}`}>
          {inModal ? (
            <div className="prose max-w-none">
              <ReactMarkdown>{content?.textContent}</ReactMarkdown>
            </div>
          ) : (
            <AspectRatio ratio={1}>
              <div className="w-full h-full p-4 flex flex-col">
                <div className="w-full h-full overflow-hidden relative">
                  <div className="text-sm text-gray-700 font-mono whitespace-pre-wrap break-words">
                    {content?.textContent}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-200" />
                </div>
              </div>
            </AspectRatio>
          )}
        </div>
      ),
      "application/pdf": (
        <div className={`relative w-full h-full flex items-center justify-center ${!inModal && 'bg-gray-200'}`}>
          {inModal ? (
            <div className="w-full h-full">
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
        <div className={`w-full h-full ${inModal ? 'p-8 overflow-auto bg-white' : 'bg-gray-200'}`}>
          {inModal ? (
            <div className="font-mono text-sm text-gray-800 whitespace-pre-wrap break-words">
              {content?.textContent}
            </div>
          ) : (
            <AspectRatio ratio={1}>
              <div className="w-full h-full p-4 flex flex-col">
                <div className="w-full h-full overflow-hidden relative">
                  <div className="font-mono text-sm text-gray-700 whitespace-pre-wrap break-words">
                    {content?.textContent}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-200" />
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
      <ContentValidator
        transactionId={transaction.id}
        contentUrl={content.url || ''}
        contentType={contentType}
        imageObjectUrl={content.imageObjectUrl || ''}
      />
      {renderContent()}
      {(showStats || !isMintable) && predictions && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white p-4 z-20">
          <p className="text-lg font-bold mb-4">Content Classification</p>
          <div className="space-y-3 w-full max-w-sm">
            {Object.entries(predictions).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{key}</span>
                  <span>{(Number(value) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={Number(value) * 100} className="h-1" />
              </div>
            ))}
          </div>
          {!isMintable && (
            <p className="mt-4 text-red-400 text-sm">This content is not mintable.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(ContentRenderer);
