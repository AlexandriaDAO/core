import React from "react";
import { Reader } from "@/features/reader";
import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";
import { supportedMimeTypes } from "../types/files";
import { ContentRendererProps } from "../types/queries";
import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useContent } from '../hooks/useContent';

const TextContent: React.FC<{ contentType: string; content: string }> = ({ contentType, content }) => {
  const language = contentType === "application/json" ? "json" : contentType === "text/html" ? "html" : "text";
  
  if (contentType === "text/markdown") {
    return <ReactMarkdown>{content}</ReactMarkdown>;
  }
  
  return (
    <SyntaxHighlighter language={language} style={docco}>
      {content}
    </SyntaxHighlighter>
  );
};

export default function ContentRenderer({ contentId, contentType }: ContentRendererProps) {
  const { contentData } = useContent([{ id: contentId, owner: '', tags: [], block: null, data: { size: 0, type: '' } }]);
  const content = contentData[contentId];

  if (content?.error) {
    return <p className="text-white">{content.error}</p>;
  }

  if (!contentType || !supportedMimeTypes.includes(contentType)) {
    return <p className="text-white">Unsupported content type: {contentType || 'Unknown'}</p>;
  }

  const renderContent = () => {
    switch (true) {
      case contentType === "application/epub+zip":
        return (
          <ReaderProvider>
            <div className="h-full pt-8">
              <Reader bookUrl={content?.url || ''} />
            </div>
          </ReaderProvider>
        );

      case contentType === "application/pdf":
        return (
          <object data={content?.url || ''} type="application/pdf" width="100%" height="100%">
            <p>PDF plugin not available. <a href={content?.url || '#'}>Download the PDF file.</a></p>
          </object>
        );

      case ["text/plain", "text/markdown", "application/json", "text/html"].includes(contentType):
        return (
          <div className="p-4 bg-white text-black overflow-auto h-full">
            <TextContent contentType={contentType} content={content?.textContent || ''} />
          </div>
        );

      case contentType.startsWith("audio/"):
        return <audio controls src={content?.url || ''} className="w-full" />;

      case contentType.startsWith("image/"):
        return content?.imageObjectUrl && (
          <img src={content.imageObjectUrl} alt="Selected content" className="max-w-full max-h-full object-contain" loading="lazy" />
        );

      case contentType.startsWith("video/"):
        return <video src={content?.url || ''} controls className="max-w-full max-h-full" />;

      default:
        return <p className="text-white">Unsupported content type: {contentType}</p>;
    }
  };

  return (
    <div className="flex justify-center items-center h-full">
      {renderContent()}
    </div>
  );
}
