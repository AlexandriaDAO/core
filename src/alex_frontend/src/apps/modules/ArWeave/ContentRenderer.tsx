import React, { useState, useEffect } from "react";
import { Reader } from "@/features/reader";
import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";
import { supportedMimeTypes } from "./types/files";
import { ContentRendererProps } from "./types/queries";
import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export default function ContentRenderer({ contentId, contentType }: ContentRendererProps) {
  const [actualContentType, setActualContentType] = useState(contentType);
  const [content, setContent] = useState<string | null>(null);
  const contentUrl = `https://arweave.net/${contentId}`;

  useEffect(() => {
    if (!contentType) {
      // Fetch content type if not provided
      fetch(contentUrl, { method: 'HEAD' })
        .then(response => {
          const fetchedContentType = response.headers.get('Content-Type');
          if (fetchedContentType) setActualContentType(fetchedContentType);
        })
        .catch(error => console.error("Error fetching content type:", error));
    }

    // Fetch content for text-based files
    if (actualContentType && ['text/plain', 'text/markdown', 'application/json', 'text/html'].includes(actualContentType)) {
      fetch(contentUrl)
        .then(response => response.text())
        .then(text => setContent(text))
        .catch(error => console.error("Error fetching content:", error));
    }
  }, [contentId, contentType, contentUrl, actualContentType]);

  if (!actualContentType || !supportedMimeTypes.includes(actualContentType)) {
    return <p className="text-white">Unsupported or unknown content type: {actualContentType}</p>;
  }

  switch (actualContentType) {
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
      return (
        <div className="p-4 bg-white text-black overflow-auto h-full">
          <pre>{content}</pre>
        </div>
      );

    case "text/markdown":
      return (
        <div className="p-4 bg-white text-black overflow-auto h-full">
          <ReactMarkdown>{content || ''}</ReactMarkdown>
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

    case "application/json":
      return (
        <div className="p-4 bg-white text-black overflow-auto h-full">
          <SyntaxHighlighter language="json" style={docco}>
            {content || ''}
          </SyntaxHighlighter>
        </div>
      );

    case "text/html":
      return (
        <div className="p-4 bg-white text-black overflow-auto h-full">
          <SyntaxHighlighter language="html" style={docco}>
            {content || ''}
          </SyntaxHighlighter>
        </div>
      );

    default:
      return <p className="text-white">Unsupported content type: {actualContentType}</p>;
  }
}