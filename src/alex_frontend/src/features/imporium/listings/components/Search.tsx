import React, { useState } from 'react';
import { Input } from '@/lib/components/input';
import { Button } from '@/lib/components/button';
import { SearchIcon, X } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import { clearSearch, setQuery } from '../listingsSlice';
import { useNavigate } from '@tanstack/react-router';
import { useAppSelector } from '@/store/hooks/useAppSelector';

const Search: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { query } = useAppSelector((state) => state.imporium.listings);

    const handleClear = () => {
        dispatch(clearSearch());

        navigate({
            to: '/app/imporium/marketplace',
            search: { search: undefined }
        })
    };

    const handleSearch = async () => {
        if (query.trim()) navigate({ to: '/app/imporium/marketplace', search: { search: query } })
        else handleClear();
    };

    return (
        <>
            <div className="flex-grow relative min-w-56">
                <SearchIcon className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2" />
                <Input
                    value={query}
                    onChange={(e) => dispatch(setQuery(e.target.value))}
                    placeholder="Search by ID or Principal"
                    className='w-full h-full px-8 bg-transparent font-syne border-border'
                    scale="md"
                    rounded="lg"
                    variant="default"
                />
                {query && <X className="w-4 h-4 absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 cursor-pointer" onClick={handleClear} />}
            </div>

            <Button variant="inverted" scale="md" rounded="lg" className='font-syne border-border' onClick={handleSearch}>
                Search
            </Button>
        </>
    );
};

export default Search;