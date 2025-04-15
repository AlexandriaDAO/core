import React from 'react';
import { Button } from '@/lib/components/button';
import { X } from 'lucide-react';
import { useTagActions } from '../hooks/useTagActions';
import { useTagData } from '../hooks/useTagData';

export const TagFilterDisplay: React.FC = () => {
    const { setTagFilter } = useTagActions();
    const { currentTagFilter } = useTagData();

    const handleClearFilter = () => {
        setTagFilter(null);
    };

    if (!currentTagFilter) {
        return null; // Don't render anything if no filter is active
    }

    return (
        <div className="flex items-center gap-2 mb-4 p-2 bg-secondary/20 border border-secondary rounded-md">
            <span className="text-sm text-secondary-foreground">
                Showing shelves tagged:
            </span>
            <span className="font-semibold text-sm text-secondary-foreground">
                {currentTagFilter}
            </span>
            <Button 
                variant="ghost" 
                scale="icon"
                className="h-6 w-6 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={handleClearFilter}
                aria-label="Clear tag filter"
            >
                <X size={16} />
            </Button>
        </div>
    );
}; 