
export interface Metadata {
  title: string;
  fiction: boolean;
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