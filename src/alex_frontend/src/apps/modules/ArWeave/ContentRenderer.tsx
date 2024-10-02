import React, { useState, useEffect } from "react";
import { Reader } from "@/features/reader";
import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";
import { supportedMimeTypes } from "./types/files";
import { ContentRendererProps } from "./types/queries";

export default function ContentRenderer({ contentId, contentType }: ContentRendererProps) {
  const [actualContentType, setActualContentType] = useState(contentType);
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
  }, [contentId, contentType, contentUrl]);

  if (!actualContentType || !supportedMimeTypes.includes(actualContentType)) {
    return <p className="text-white">Unsupported or unknown content type: {actualContentType}</p>;
  }

  if (actualContentType === "application/epub+zip") {
    return (
      <ReaderProvider>
        <div className="h-full pt-8">
          <Reader bookUrl={contentUrl} />
        </div>
      </ReaderProvider>
    );
  }

  if (actualContentType.startsWith("image/")) {
    return (
      <div className="flex justify-center items-center h-full">
        <img
          src={contentUrl}
          alt="Selected content"
          className="max-w-full max-h-full object-contain"
        />
      </div>
    );
  }

  return <p className="text-white">Unsupported content type: {actualContentType}</p>;
}