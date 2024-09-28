import React from "react";
import { Reader } from "@/features/reader";
import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";
import { supportedMimeTypes } from "./types/files";

interface ContentRendererProps {
  contentId: string;
  contentType: string;
}

export default function ContentRenderer({ contentId, contentType }: ContentRendererProps) {
  const contentUrl = `https://arweave.net/${contentId}`;

  if (!supportedMimeTypes.includes(contentType)) {
    return <p className="text-white">Unsupported content type: {contentType}</p>;
  }

  if (contentType === "application/epub+zip") {
    return (
      <ReaderProvider>
        <div className="h-full pt-8">
          <Reader bookUrl={contentUrl} />
        </div>
      </ReaderProvider>
    );
  }

  if (contentType.startsWith("image/")) {
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
}