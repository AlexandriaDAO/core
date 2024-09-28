export interface FileTypeConfig {
  mimeType: string;
  extension: string;
  displayName: string;
}

export const supportedFileTypes: FileTypeConfig[] = [
  { mimeType: "application/epub+zip", extension: "epub", displayName: "EPUB" },
  { mimeType: "image/png", extension: "png", displayName: "PNG" },
  { mimeType: "image/jpeg", extension: "jpeg", displayName: "JPEG" },
  { mimeType: "image/gif", extension: "gif", displayName: "GIF" },
];

export const supportedMimeTypes = supportedFileTypes.map(type => type.mimeType);