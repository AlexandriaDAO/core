import { getCover } from "@/utils/epub";
import { ContentUrlInfo } from "../types";

export type ContentTypeHandlerMap = {
  "application/epub+zip": (id: string) => Promise<ContentUrlInfo>;
  "application/pdf": (id: string) => Promise<ContentUrlInfo>;
  "image/": (id: string) => Promise<ContentUrlInfo>;
  "video/": (id: string) => Promise<ContentUrlInfo>;
  [key: string]: (id: string) => Promise<ContentUrlInfo>;
};

export const createContentTypeHandlers = (contentData: any): ContentTypeHandlerMap => ({
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
    const url = content?.imageObjectUrl || `https://arweave.net/${id}`;
    return {
      thumbnailUrl: url,
      coverUrl: url,
      fullUrl: url,
    };
  },
  "video/": async (id: string) => ({
    thumbnailUrl: null,
    coverUrl: null,
    fullUrl: `https://arweave.net/${id}`
  })
});
