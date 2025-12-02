import React from 'react';
import { LoaderPinwheel } from 'lucide-react';

const ContentLoadingSpinner = () => {
  return (
    <div className="flex-grow flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <LoaderPinwheel className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

export default ContentLoadingSpinner;