export interface FileTypeConfig {
  mimeType: string;
  extension: string;
  displayName: string;
}

interface FileTypeGroup {
  displayName: string;
  extension: string;
  mimeTypes: string[];
}

const fileTypeGroups: FileTypeGroup[] = [
  {
    displayName: "JPEG",
    extension: "jpeg",
    mimeTypes: ["image/jpeg", "application/jpeg", "image/jpg", "application/jpg"]
  },
  {
    displayName: "PNG",
    extension: "png",
    mimeTypes: ["image/png", "application/png"]
  },
  {
    displayName: "SVG",
    extension: "svg",
    mimeTypes: ["image/svg+xml", "application/svg+xml"]
  },
  {
    displayName: "GIF",
    extension: "gif",
    mimeTypes: ["image/gif", "application/gif"]
  },
  { displayName: "EPUB", extension: "epub", mimeTypes: ["application/epub+zip"] },
  { displayName: "MP4", extension: "mp4", mimeTypes: ["video/mp4"] },
  { displayName: "WebM", extension: "webm", mimeTypes: ["video/webm"] },
  { displayName: "PDF", extension: "pdf", mimeTypes: ["application/pdf"] },
  { displayName: "Text", extension: "txt", mimeTypes: ["text/plain"] },
  { displayName: "Markdown", extension: "md", mimeTypes: ["text/markdown"] },
  { displayName: "MP3", extension: "mp3", mimeTypes: ["audio/mpeg"] },
  { displayName: "WAV", extension: "wav", mimeTypes: ["audio/wav"] },
  { displayName: "OGG", extension: "ogg", mimeTypes: ["audio/ogg"] },
  { displayName: "JSON", extension: "json", mimeTypes: ["application/json"] },
  { displayName: "HTML", extension: "html", mimeTypes: ["text/html"] },
  { displayName: "CSV", extension: "csv", mimeTypes: ["text/csv"] },
  { displayName: "XML", extension: "xml", mimeTypes: ["text/xml", "application/xml"] },
  { displayName: "YAML", extension: "yaml", mimeTypes: ["application/x-yaml", "text/yaml"] },
];

export const supportedFileTypes: FileTypeConfig[] = fileTypeGroups.flatMap(group => 
  group.mimeTypes.map(mimeType => ({
    mimeType,
    extension: group.extension,
    displayName: group.displayName
  }))
);

export const fileTypeCategories: Record<string, string[]> = {
  all: supportedFileTypes.map(type => type.mimeType),
  favorites: fileTypeGroups
    .filter(group => ["JPEG", "EPUB", "MP4"].includes(group.displayName))
    .flatMap(group => group.mimeTypes),
  images: fileTypeGroups
    .filter(group => ["JPEG", "PNG", "GIF", "SVG"].includes(group.displayName))
    .flatMap(group => group.mimeTypes),
  books: fileTypeGroups
    .filter(group => ["EPUB"].includes(group.displayName))
    .flatMap(group => group.mimeTypes),
  text: fileTypeGroups
    .filter(group => ["Text", "Markdown", "PDF", "HTML"].includes(group.displayName))
    .flatMap(group => group.mimeTypes),
  video: fileTypeGroups
    .filter(group => ["MP4", "WebM", "GIF"].includes(group.displayName))
    .flatMap(group => group.mimeTypes),
  audio: fileTypeGroups
    .filter(group => ["MP3", "WAV", "OGG"].includes(group.displayName))
    .flatMap(group => group.mimeTypes),
  data: fileTypeGroups
    .filter(group => ["JSON", "CSV", "XML", "YAML"].includes(group.displayName))
    .flatMap(group => group.mimeTypes),
};