export interface FileTypeConfig {
  mimeType: string;
  extension: string;
  displayName: string;
}

export const supportedFileTypes: FileTypeConfig[] = [
  { mimeType: "image/jpeg", extension: "jpeg", displayName: "JPEG" },
  { mimeType: "image/jpg", extension: "jpg", displayName: "JPG" },
  { mimeType: "image/png", extension: "png", displayName: "PNG" },
  { mimeType: "application/epub+zip", extension: "epub", displayName: "EPUB" },
  { mimeType: "video/mp4", extension: "mp4", displayName: "MP4" },
  { mimeType: "video/webm", extension: "webm", displayName: "WebM" },
  { mimeType: "application/pdf", extension: "pdf", displayName: "PDF" },
  { mimeType: "text/plain", extension: "txt", displayName: "Text" },
  { mimeType: "text/markdown", extension: "md", displayName: "Markdown" },
  { mimeType: "audio/mpeg", extension: "mp3", displayName: "MP3" },
  { mimeType: "audio/wav", extension: "wav", displayName: "WAV" },
  { mimeType: "audio/ogg", extension: "ogg", displayName: "OGG" },
  { mimeType: "image/svg+xml", extension: "svg", displayName: "SVG" },
  { mimeType: "application/json", extension: "json", displayName: "JSON" },
  { mimeType: "text/html", extension: "html", displayName: "HTML" },
  { mimeType: "image/gif", extension: "gif", displayName: "GIF" },
];

export const supportedMimeTypes = supportedFileTypes.map(type => type.mimeType);

export const fileTypeCategories: Record<string, string[]> = {
  images: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/svg+xml"],
  books: ["application/epub+zip"],
  text: ["text/plain", "text/markdown", "application/json", "text/html", "application/pdf"],
  video: ["video/mp4", "video/webm", "image/gif"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg"],
};