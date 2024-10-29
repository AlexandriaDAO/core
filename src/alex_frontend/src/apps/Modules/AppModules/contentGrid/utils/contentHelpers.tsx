import React from 'react';
import { Image, Play, FileAudio, FileCode, File } from 'lucide-react';

export const getFileIcon = (contentType: string) => {
  if (contentType.startsWith("image/")) return <Image />;
  if (contentType.startsWith("video/")) return <Play />;
  if (contentType.startsWith("audio/")) return <FileAudio />;
  if (contentType === "application/pdf") return <File />;
  if (["text/plain", "text/markdown", "application/json", "text/html"].includes(contentType)) return <FileCode />;
  return <File />;
};

export const isImageType = (contentType: string) => contentType.startsWith('image/');
export const isVideoType = (contentType: string) => contentType.startsWith('video/');
export const isTextType = (contentType: string) => {
  return ["text/plain", "text/markdown", "application/json", "text/html"].includes(contentType);
};

