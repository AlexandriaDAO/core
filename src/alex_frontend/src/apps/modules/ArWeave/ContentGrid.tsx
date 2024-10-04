import React from "react";

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
    <div
      className="aspect-square border border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-800 flex flex-col items-center justify-center text-center relative overflow-hidden bg-gray-900"
      onClick={onClick}
    >
      {children}
    </div>
  );
}

ContentGrid.Item = ContentGridItem;

export default ContentGrid;