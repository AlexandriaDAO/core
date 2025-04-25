import React, { useState } from 'react';
import { Input } from '@/lib/components/input';
import { Button } from '@/lib/components/button';
import { SearchIcon, X } from 'lucide-react';
import useEmporium from '@/hooks/actors/useEmporium';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import search from '../thunks/search';
import { clearFound } from '../listingsSlice';

const Search: React.FC = () => {
    const { actor } = useEmporium();
    const dispatch = useAppDispatch();
    const [query, setQuery] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    const handleClear = () => {
        setQuery('');
        dispatch(clearFound());
    };

    const handleSearch = async () => {
        if (!actor) return;

        dispatch(search({actor, query}))
    };

    return (
        <>
            <div className="flex-grow relative min-w-56">
                <SearchIcon className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2" />
                <Input
                    value={query}
                    onChange={handleChange}
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