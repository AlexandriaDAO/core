import React from "react";
import { Reader } from "@/features/reader";
import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";

interface ContentRendererProps {
  contentId: string;
  contentType: string;
}

export default function ContentRenderer({ contentId, contentType }: ContentRendererProps) {
  const contentUrl = `https://arweave.net/${contentId}`;

  switch (contentType) {
    case "application/epub+zip":
      return (
        <ReaderProvider>
          <Reader bookUrl={contentUrl} />
        </ReaderProvider>
      );
    case "image/png":
    case "image/jpeg":
    case "image/gif":
      return (
        <div className="flex justify-center items-center mt-4">
          <img
            src={contentUrl}
            alt="Selected content"
            className="max-w-full max-h-[80vh] object-contain"
          />
        </div>
      );
    default:
      return <p>Unsupported content type: {contentType}</p>;
  }
}