import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/lib/components/card";
import { Copy, Check } from "lucide-react";

interface ContentGridProps {
  children: React.ReactNode;
}

interface ContentGridItemProps {
  children: React.ReactNode;
  onClick: () => void;
  id?: string;
}

function ContentGrid({ children }: ContentGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-white">
      {children}
    </div>
  );
}

function ContentGridItem({ children, onClick, id }: ContentGridItemProps) {
  const [copied, setCopied] = useState(false);

  const formatId = (id: string) => {
    if (!id) return 'N/A';
    return `${id.slice(0, 4)}...${id.slice(-4)}`;
  };

  const handleCopy = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Card
      className="cursor-pointer hover:bg-gray-50 flex flex-col relative overflow-hidden bg-white h-full"
      onClick={onClick}
    >
      {/* Top ID section */}
      <CardHeader className="flex flex-col items-start px-4 py-2 gap-2">
        <div className="flex items-center gap-2 w-full">
          <span className="text-sm">ID: {id ? formatId(id) : 'N/A'}</span>
          {id && (
            copied ? (
              <Check 
                className="h-4 w-4 text-green-500" 
              />
            ) : (
              <Copy 
                className="h-4 w-4 cursor-pointer hover:text-gray-600" 
                onClick={(e) => handleCopy(e, id)}
              />
            )
          )}
        </div>
      </CardHeader>

      {/* Center content section with aspect ratio container */}
      <CardContent className="flex flex-col items-start gap-4 p-0">
        <div className="aspect-square w-full flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
          {children}
        </div>
      </CardContent>

      {/* Bottom section - slightly taller than original */}
      <CardFooter className="flex flex-col items-start w-full rounded-lg border border-[--border] bg-[--card] mt-2 flex-grow min-h-[100px]">
        {/* Content for the bottom section will be added later */}
      </CardFooter>
    </Card>
  );
}

ContentGrid.Item = ContentGridItem;

export default ContentGrid;