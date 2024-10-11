import React, { useState, useEffect } from "react";
import { Reader } from "@/features/reader";
import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";
import { supportedMimeTypes } from "../types/files";
import { ContentRendererProps } from "../types/queries";
import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export default function ContentRenderer({ contentId, contentType }: ContentRendererProps) {
  const [textContent, setTextContent] = useState<string | null>(null);
  const contentUrl = `https://arweave.net/${contentId}`;

  useEffect(() => {
    if (contentType && ['text/plain', 'text/markdown', 'application/json', 'text/html'].includes(contentType)) {
      fetch(contentUrl)
        .then(response => response.text())
        .then(text => setTextContent(text))
        .catch(error => console.error("Error fetching content:", error));
    }
  }, [contentId, contentType, contentUrl]);

  if (!contentType) {
    return <p className="text-white">Unknown content type</p>;
  }

  if (!supportedMimeTypes.includes(contentType)) {
    return <p className="text-white">Unsupported content type: {contentType}</p>;
  }

  const renderTextContent = () => {
    switch (contentType) {
      case "text/plain":
        return <pre>{textContent}</pre>;
      case "text/markdown":
        return <ReactMarkdown>{textContent || ''}</ReactMarkdown>;
      case "application/json":
      case "text/html":
        return (
          <SyntaxHighlighter language={contentType === "application/json" ? "json" : "html"} style={docco}>
            {textContent || ''}
          </SyntaxHighlighter>
        );
      default:
        return null;
    }
  };

  switch (contentType) {
    case "application/epub+zip":
      return (
        <ReaderProvider>
          <div className="h-full pt-8">
            <Reader bookUrl={contentUrl} />
          </div>
        </ReaderProvider>
      );

    case "application/pdf":
      return (
        <div className="flex justify-center items-center h-full">
          <object
            data={contentUrl}
            type="application/pdf"
            width="100%"
            height="100%"
          >
            <p>It appears you don't have a PDF plugin for this browser. You can <a href={contentUrl}>click here to download the PDF file.</a></p>
          </object>
        </div>
      );

    case "text/plain":
    case "text/markdown":
    case "application/json":
    case "text/html":
      return (
        <div className="p-4 bg-white text-black overflow-auto h-full">
          {renderTextContent()}
        </div>
      );

    case "audio/mpeg":
    case "audio/wav":
    case "audio/ogg":
      return (
        <div className="flex justify-center items-center h-full">
          <audio controls src={contentUrl}>
            Your browser does not support the audio element.
          </audio>
        </div>
      );

    case "image/svg+xml":
    case "image/png":
    case "image/jpeg":
    case "image/jpg":
    case "image/gif":
      return (
        <div className="flex justify-center items-center h-full">
          <img
            src={contentUrl}
            alt="Selected content"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );

    case "video/mp4":
    case "video/webm":
      return (
        <div className="flex justify-center items-center h-full">
          <video
            src={contentUrl}
            controls
            className="max-w-full max-h-full"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );

    default:
      return <p className="text-white">Unsupported content type: {contentType}</p>;
  }
}