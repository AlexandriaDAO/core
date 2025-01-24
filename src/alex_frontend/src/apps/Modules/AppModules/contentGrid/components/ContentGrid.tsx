import React from 'react';
import { BaseProps } from '../types/contentGrid.types';
import { ContentGridItem } from './ContentGridItem';

export function ContentGrid({ children }: BaseProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 p-2 sm:p-4 pb-16">
      {children}
    </div>
  );
}

ContentGrid.Item = ContentGridItem; 