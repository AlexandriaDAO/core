import React from 'react';
import { Input } from '@/lib/components/input';
import { Button } from '@/lib/components/button';
import { SearchIcon } from 'lucide-react';

const SearchPrincipal: React.FC = () => {
    return (
        <>
            <div className="flex-grow relative min-w-56">
                <SearchIcon className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2" />
                <Input
                    placeholder="Search by Principal"
                    className='w-full h-full pl-8 bg-transparent font-syne border-border'
                    scale="md"
                    rounded="lg"
                    variant="default"
                />
            </div>

            <Button variant="inverted" scale="md" rounded="lg" className='font-syne border-border'>
                Search
            </Button>
        </>
    );
};

export default SearchPrincipal;