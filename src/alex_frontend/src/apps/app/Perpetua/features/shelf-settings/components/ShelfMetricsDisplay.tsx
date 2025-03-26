import React, { useState } from 'react';
import { useShelfMetrics } from '../hooks';
import { formatMetricValue, isRebalanceRecommended } from '../utils';

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

  const needsRebalance = isRebalanceRecommended(metrics);

  return (
    <div className="mt-3">
      {onRebalance && (
        <div className="flex items-center">
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
                  <div className="flex justify-between">
                    <span>Rebalance count:</span>
                    <span>{formatMetricValue(metrics.rebalance_count)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Needs rebalance:</span>
                    <span>{metrics.needs_rebalance ? "Yes" : "No"}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 border-t pt-2">
                  When items are reordered many times, internal position values can become too close together.
                  Rebalancing is recommended after approximately 40+ reorderings in the same area.
                </p>
              </div>
            }
          >
            <button
              onClick={() => onRebalance(shelfId)}
              className={`mr-2 px-3 py-1 text-sm rounded-md ${
                needsRebalance
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } transition-colors`}
              disabled={!needsRebalance}
            >
              {needsRebalance ? "Rebalance Items" : "Items Balanced"}
            </button>
          </HoverCard>
          
          <SimpleTooltip 
            content={
              <p className="w-64 text-xs">
                Rebalancing optimizes the internal position values for better performance when you've done many item reorderings.
              </p>
            }
          >
            <div className="cursor-help text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
            </div>
          </SimpleTooltip>
        </div>
      )}
    </div>
  );
}; 