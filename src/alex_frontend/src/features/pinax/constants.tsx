import React from "react";
import { BookOpen, FileText, ImageIcon, Video } from "lucide-react";

export const FILE_TYPES = {
  images: {
    types: [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml"
    ],
    icon: <ImageIcon className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />,
    label: "Images",
    maxSize: 20 * 1024 * 1024, // 20MB
    description: "Photos and graphics"
},
  documents: {
    types: ["application/pdf", "text/plain", "text/markdown", "text/html", "application/json"],
    icon: <FileText className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />,
    label: "Documents",
    maxSize: 50 * 1024 * 1024, // 50MB
    description: "PDF and text files"
  },
  media: {
    types: [
        "video/mp4",
        "video/webm",
        "audio/mpeg", // or mp3. There is also a video/mpeg which is not included
        "audio/wav",
        "audio/ogg"
    ],
    icon: <Video className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />,
    label: "Media",
    maxSize: 100 * 1024 * 1024, // 100MB
    description: "Video and audio files"
  },
  ebooks: {
    types: ["application/epub+zip"],
    icon: <BookOpen className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />,
    label: "E-books",
    maxSize: 30 * 1024 * 1024, // 30MB
    description: "E-books and other digital publications"
  },
};

export const allowedTypes = Object.values(FILE_TYPES).flatMap(category => category.types);

export const getFileTypeInfo = (mimeType: string) => {
  return Object.values(FILE_TYPES).find(category => 
    category.types.includes(mimeType)
  );
}; 


// Helper function to get a more user-friendly file type name
export const getFileTypeName = (mimeType: string): string => {
    const extension = mimeType.split('/')[1].toUpperCase();
    const commonNames: Record<string, string> = {
        'jpeg': 'JPEG',
        'png': 'PNG',
        'pdf': 'PDF',
        'mp4': 'MP4',
        'webm': 'WEBM',
        'mpeg': 'MPEG',
        'wav': 'WAV',
        'ogg': 'OGG',
        'epub+zip': 'EPUB',
        'svg+xml': 'SVG',
        'webp': 'WEBP',
        'gif': 'GIF',
        'html': 'HTML',
        'json': 'JSON',
        'markdown': 'MARKDOWN',
        'txt': 'TXT',
    };
    return commonNames[extension] || extension;
};