import { getCover } from "@/utils/epub";
import { ContentTypeHandler, ContentUrlInfo } from "../types/content.types";
import { ContentDataItem } from "../types/content.types";

export const createContentTypeHandlers = (contentData: Record<string, ContentDataItem>): ContentTypeHandler => ({
  "application/epub+zip": async (id: string) => {
    const coverUrl = await getCover(`https://arweave.net/${id}`);
    return {
      thumbnailUrl: coverUrl,
      coverUrl: coverUrl,
      fullUrl: `https://arweave.net/${id}`
    };
  },
  "application/pdf": async (id: string) => ({
    thumbnailUrl: null,
    coverUrl: null,
    fullUrl: `https://arweave.net/${id}`
  }),
  "image/": async (id: string) => {
    const content = contentData[id];
    return {
      thumbnailUrl: content?.imageObjectUrl || `https://arweave.net/${id}`,
      coverUrl: content?.imageObjectUrl || `https://arweave.net/${id}`,
      fullUrl: content?.imageObjectUrl || `https://arweave.net/${id}`
    };
  },
  "video/": async (id: string) => ({
    thumbnailUrl: null,
    coverUrl: null,
    fullUrl: `https://arweave.net/${id}`
  }),
});
