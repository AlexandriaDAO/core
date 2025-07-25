import { Button } from '@/lib/components/button';
import React, { useCallback } from 'react';
import { ListFilter } from 'lucide-react';
import { Badge } from '@/lib/components/badge';
import { useAppSelector } from '@/store/hooks/useAppSelector';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { toggleSortByPrice } from '../listingsSlice';
import getListings from '../thunks/getListings';

const PriceSort: React.FC = () => {
    const dispatch = useAppDispatch();
    const { sortByPrice, found, page, size } = useAppSelector((state) => state.imporium.listings);

    const handleSort = useCallback(() => {
        dispatch(getListings({page, size, sortByPrice, sortByTime: null}));

        dispatch(toggleSortByPrice());
    }, [page, size, sortByPrice]);

    return (
        <Button onClick={handleSort} variant="outline" scale="md" rounded="lg" className='font-syne border-border relative' disabled={Object.keys(found).length > 0}>
            <span className="font-medium">Price</span>
            <ListFilter className="w-4 h-4" />
            {sortByPrice !== null && <Badge className="absolute -top-2 -right-2 flex items-center justify-center px-2 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                {sortByPrice ? 'asc' : 'desc'}
            </Badge>}
        </Button>
    );
};

export default PriceSort;