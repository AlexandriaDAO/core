import { Button } from '@/lib/components/button';
import React, { useCallback } from 'react';
import { ListFilter } from 'lucide-react';
import { Badge } from '@/lib/components/badge';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { toggleSortByTime } from '../listingsSlice';
import getListings from '../thunks/getListings';

const TimeSort: React.FC = () => {
    const dispatch = useAppDispatch();
    const { sortByTime, found, page, size, sortByPrice } = useAppSelector((state) => state.imporium.listings);

    const handleSort = useCallback(() => {
        dispatch(getListings({page, size, sortByPrice: null, sortByTime}));

        dispatch(toggleSortByTime());
    }, [page, size, sortByPrice, sortByTime]);

    return (
        <Button onClick={handleSort} variant="outline" scale="md" rounded="lg" className='font-syne border-border relative' disabled={Object.keys(found).length > 0}>
            <span className="font-medium">Time</span>
            <ListFilter className="w-4 h-4" />
            {sortByTime !== null && <Badge className="absolute -top-2 -right-2 flex items-center justify-center px-2 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                {sortByTime ? 'asc' : 'desc'}
            </Badge>}
        </Button>
    );
};

export default TimeSort;