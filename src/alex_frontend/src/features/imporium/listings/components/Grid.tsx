import React, { useState } from 'react';
import { Button } from '@/lib/components/button';
import { Grid2x2, Grid3x3 } from 'lucide-react';

const Grid: React.FC = () => {
    const [view, setView] = useState<'2x2' | '3x3'>('2x2');

    return (
        <div className='font-syne bg-secondary rounded-lg flex justify-center items-center gap-2 px-2 border'>
            <Button variant="outline" scale="icon" rounded="lg" className={`font-syne border py-1.5 px-3 ${view == '2x2' ? 'bg-white hover:bg-white' : 'bg-transparent hover:bg-white'}`} onClick={() => setView('2x2')}>
                <Grid2x2 strokeWidth={1} className="w-4 h-4" />
            </Button>
            <Button variant="outline" scale="icon" rounded="lg" className={`font-syne border py-1.5 px-3 ${view == '3x3' ? 'bg-white hover:bg-white' : 'bg-transparent hover:bg-white'}`}  onClick={() => setView('3x3')}>
                <Grid3x3 strokeWidth={1} className="w-4 h-4" />
            </Button>
        </div>
    );
};

export default Grid;