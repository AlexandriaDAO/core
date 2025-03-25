import { useState, useEffect } from 'react';
import { getActorPerpetua } from '@/features/auth/utils/authUtils';

export interface ShelfMetrics {
  item_count: bigint;
  min_gap: number;
  max_gap: number;
  avg_gap: number;
  rebalance_count: number;
  needs_rebalance: boolean;
}

export const useShelfMetrics = (shelfId: string, isExpanded: boolean) => {
  const [metrics, setMetrics] = useState<ShelfMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMetrics = async () => {
      if (!isExpanded) return; // Only load metrics when expanded
      
      try {
        setLoading(true);
        const perpetuaActor = await getActorPerpetua();
        const result = await perpetuaActor.get_shelf_position_metrics(shelfId);
        
        if ("Ok" in result) {
          setMetrics(result.Ok);
        }
      } catch (error) {
        console.error("Failed to load metrics:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMetrics();
  }, [shelfId, isExpanded]);

  return { metrics, loading };
}; 