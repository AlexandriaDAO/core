import React from 'react';
import { Input } from '@/lib/components/input';
import { Button } from '@/lib/components/button';
import { SearchIcon, X } from 'lucide-react';
import useEmporium from '@/hooks/actors/useEmporium';
import { useAppDispatch } from '@/store/hooks/useAppDispatch';
import searchById from '../thunks/searchById';
import { clearSearch, setQuery } from '../listingsSlice';
import { useAppSelector } from '@/store/hooks/useAppSelector';

interface SearchIdProps {
    owner?: string;
}

const SearchId: React.FC<SearchIdProps> = ({ owner }) => {
    const { actor } = useEmporium();
    const dispatch = useAppDispatch();
    const {query } = useAppSelector(state=>state.imporium.listings);

    const handleSearch = async () => {
        if (!actor) return;

        dispatch(searchById({actor, query, owner})).unwrap().then((res) => {
            console.log(res);
        });
    };

    return (
        <>
            <div className="flex-grow relative min-w-56">
                <SearchIcon className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2" />
                <Input
                    value={query}
                    onChange={(e)=>dispatch(setQuery(e.target.value))}
                    placeholder="Search by ID"
                    className='w-full h-full px-8 bg-transparent font-syne border-border'
                    scale="md"
                    rounded="lg"
                    variant="default"
                />
                {query && <X className="w-4 h-4 absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 cursor-pointer" onClick={()=>dispatch(clearSearch())} />}
            </div>

            <Button variant="inverted" scale="md" rounded="lg" className='font-syne border-border' onClick={handleSearch}>
                Search
            </Button>
        </>
    );
};

export default SearchId;