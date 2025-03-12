import { ShelfMetrics } from '../hooks/useShelfMetrics';

/**
 * Formats a shelf metric value for display
 */
export const formatMetricValue = (value: number | bigint): string => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  
  // Format floating point numbers to 2 decimal places
  if (Number.isInteger(value)) {
    return value.toString();
  } else {
    return value.toFixed(2);
  }
};

/**
 * Determines if rebalancing is recommended based on metrics
 */
export const isRebalanceRecommended = (metrics: ShelfMetrics | null): boolean => {
  if (!metrics) return false;
  return metrics.needs_rebalance;
}; 