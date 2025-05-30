import { usePerpetua } from '@/hooks/actors';
import { useState, useEffect } from 'react';

export interface ShelfMetrics {
  item_count: bigint;
  min_gap: number;
  max_gap: number;
  avg_gap: number;
}

export const useShelfMetrics = (shelfId: string, isExpanded: boolean) => {
  const {actor} = usePerpetua();
  const [metrics, setMetrics] = useState<ShelfMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if(!actor) return;
    const loadMetrics = async () => {
      if (!isExpanded) return; // Only load metrics when expanded
      
      try {
        setLoading(true);
        const result = await actor.get_shelf_position_metrics(shelfId);
        
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
  }, [shelfId, isExpanded, actor]);

  return { metrics, loading };
}; 