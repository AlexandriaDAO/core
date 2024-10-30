import { Transaction } from "./queries";

export type ContentDataItem = {
  url: string | null;
  textContent: string | null;
  imageObjectUrl: string | null;
  error: string | null;
};

export interface ContentUrlInfo {
  thumbnailUrl: string | null;
  coverUrl: string | null;
  fullUrl: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export interface ContentTypeHandler {
  [key: string]: (id: string) => Promise<ContentUrlInfo>;
}
