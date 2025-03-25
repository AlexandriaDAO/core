import React from 'react';
import { useShelfMetrics } from '../hooks';
import { formatMetricValue, isRebalanceRecommended } from '../utils';

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
    return <div>Loading metrics...</div>;
  }

  if (!metrics) {
    return <div className="mb-3">No metrics available</div>;
  }

  return (
    <div className="mt-6">
      <h4 className="text-lg font-medium mb-2">Item Position Metrics</h4>
      <div className="mb-3 text-sm">
        <div className="flex justify-between mb-1">
          <span>Items:</span>
          <span>{formatMetricValue(metrics.item_count)}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Min gap:</span>
          <span>{formatMetricValue(metrics.min_gap)}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Max gap:</span>
          <span>{formatMetricValue(metrics.max_gap)}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Avg gap:</span>
          <span>{formatMetricValue(metrics.avg_gap)}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Rebalance count:</span>
          <span>{formatMetricValue(metrics.rebalance_count)}</span>
        </div>
        <div className="flex justify-between">
          <span>Needs rebalance:</span>
          <span>{metrics.needs_rebalance ? "Yes" : "No"}</span>
        </div>
      </div>
      
      {onRebalance && (
        <button 
          onClick={() => onRebalance(shelfId)}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-200"
          disabled={!isRebalanceRecommended(metrics)}
        >
          Rebalance Items
        </button>
      )}
      <p className="text-xs text-gray-500 mt-2">
        Rebalancing optimizes the internal position values for better performance with many reorderings.
      </p>
    </div>
  );
}; 