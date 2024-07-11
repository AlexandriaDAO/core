
export interface Metadata {
  title: string;
  author: string;
  fiction: boolean;
  categories: number[];
  mainCategory: number | null;
  pubyear: number;
  language: string;
}

export type Tag = {
  name: string;
  value: string;
};

export interface FileWrapper {
  file: File;
  isUploaded: boolean;
  id: string;
  previewUrl: string;
  loadingReceipt: boolean;
}

export interface UploaderConfigProps {
  showImageView?: boolean;
  showReceiptView?: boolean;
  blockchain: "EVM";
}