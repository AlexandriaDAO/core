import React from "react";
import { Card } from "@/lib/components/card";

interface ContentGridProps {
  children: React.ReactNode;
}

interface ContentGridItemProps {
  children: React.ReactNode;
  onClick: () => void;
}

function ContentGrid({ children }: ContentGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-gray-900">
      {children}
    </div>
  );
}

function ContentGridItem({ children, onClick }: ContentGridItemProps) {
  return (
    <Card
      className="aspect-square cursor-pointer hover:bg-gray-800 flex flex-col items-center justify-center text-center relative overflow-hidden bg-gray-900 border-gray-700"
      onClick={onClick}
    >
      {children}
    </Card>
  );
}

ContentGrid.Item = ContentGridItem;

export default ContentGrid;