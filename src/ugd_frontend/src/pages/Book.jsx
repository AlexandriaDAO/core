import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Reader } from '@/Reader/reader'

const Book = () => {
    const readerRootRef = useRef(); 
    const [reader, setReader] = useState(null)
    const routerLocation = useLocation();
    const queryParams = new URLSearchParams(routerLocation.search);
    const path = queryParams.get('bookPath') || 'https://uncensoredgreatsebooks.s3.us-east-2.amazonaws.com/Carl+Jung/Treasure+Island.epub'; // "bookPath"

    useEffect(() => {        
        window.ResizeObserver = undefined;

        if(readerRootRef && readerRootRef.current) readerRootRef.current.innerHTML = ''
        if(!reader){
            new Reader(path, { restore: true })
            console.log('he')
        }

    }, [])
        

    return (
        <div className="h-full max-h-full relative overflow-auto" id='ReaderRoot' ref={readerRootRef}>
        </div>
    );
};

export default Book; 