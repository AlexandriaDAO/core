import React from 'react';
import { FaImage, FaPlay, FaFileAudio, FaFilePdf, FaFileCode, FaFileAlt } from 'react-icons/fa';

export const getFileIcon = (contentType: string) => {
  if (contentType.startsWith("image/")) return <FaImage />;
  if (contentType.startsWith("video/")) return <FaPlay />;
  if (contentType.startsWith("audio/")) return <FaFileAudio />;
  if (contentType === "application/pdf") return <FaFilePdf />;
  if (["text/plain", "text/markdown", "application/json", "text/html"].includes(contentType)) return <FaFileCode />;
  return <FaFileAlt />;
};

export const isImageType = (contentType: string) => contentType.startsWith('image/');
export const isVideoType = (contentType: string) => contentType.startsWith('video/');
export const isTextType = (contentType: string) => {
  return ["text/plain", "text/markdown", "application/json", "text/html"].includes(contentType);
};

