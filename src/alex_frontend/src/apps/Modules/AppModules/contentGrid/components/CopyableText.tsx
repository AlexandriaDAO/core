import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { CopyableTextProps } from '../types/contentGrid.types';

export function CopyableText({ text, children, onCopy }: CopyableTextProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.();
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div onClick={handleCopy} className="flex items-center gap-1 cursor-pointer">
      {children}
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </div>
  );
} 