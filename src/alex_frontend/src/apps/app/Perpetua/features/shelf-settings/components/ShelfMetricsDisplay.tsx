import React, { useState } from 'react';
import { useShelfMetrics } from '../hooks';
import { formatMetricValue } from '../../../utils';

// Custom tooltip/hover implementation since shadcn components aren't installed
interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
}

const SimpleTooltip: React.FC<TooltipProps> = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="relative inline-flex" 
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full mb-2 z-50 bg-white dark:bg-gray-800 p-2 rounded-md shadow-md text-sm">
          {content}
        </div>
      )}
    </div>
  );
};

const HoverCard: React.FC<TooltipProps> = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-gray-800 p-3 rounded-md shadow-md text-sm min-w-[20rem]">
          {content}
        </div>
      )}
    </div>
  );
};

interface ShelfMetricsDisplayProps {
  shelfId: string;
  isExpanded: boolean;
  onRebalance?: (shelfId: string) => Promise<void>;
}

export const ShelfMetricsDisplay: React.FC<ShelfMetricsDisplayProps> = ({ 
  shelfId, 
  isExpanded,
  onRebalance 
}) => {
  const { metrics, loading } = useShelfMetrics(shelfId, isExpanded);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading metrics...</div>;
  }

  if (!metrics) {
    return null; // Don't show anything if no metrics available
  }

  return (
    <div className="mt-3">
      <HoverCard 
        content={
          <div className="space-y-2">
            <h4 className="font-medium">Item Position Metrics</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Items:</span>
                <span>{formatMetricValue(metrics.item_count)}</span>
              </div>
              <div className="flex justify-between">
                <span>Min gap:</span>
                <span>{formatMetricValue(metrics.min_gap)}</span>
              </div>
              <div className="flex justify-between">
                <span>Max gap:</span>
                <span>{formatMetricValue(metrics.max_gap)}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg gap:</span>
                <span>{formatMetricValue(metrics.avg_gap)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 border-t pt-2">
              Internal position values are automatically managed for optimal performance.
            </p>
          </div>
        }
      >
        <div className="cursor-help text-gray-400 inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
          </svg>
          <span className="ml-1 text-xs text-gray-500">Position Metrics</span>
        </div>
      </HoverCard>
    </div>
  );
}; 