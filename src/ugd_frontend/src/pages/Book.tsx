import React, { useEffect, useRef, useState } from 'react';
import { ReactReader as Reader } from 'react-reader';
import { useLocation } from 'react-router-dom';

import type { NavItem, Contents, Rendition } from 'epubjs'
import { Read } from '@/components/Read';
import useLocalStorageState from 'use-local-storage-state'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlassPlus, faMagnifyingGlassMinus, faArrowsUpDown, faArrowsLeftRight } from '@fortawesome/free-solid-svg-icons';

const Book = () => {
    const routerLocation = useLocation();
    const queryParams = new URLSearchParams(routerLocation.search);
    const bookPath = queryParams.get('bookPath') || 'https://uncensoredgreatsebooks.s3.us-east-2.amazonaws.com/Carl+Jung/Treasure+Island.epub'; // "bookPath"


    const [location, setLocation] = useLocalStorageState<string | number>('persist-location', { defaultValue: 0 })
    const [page, setPage] = useState('')
    const [font, setFont] = useState(100)
    const increaseFont = ()=>{
        font >= 200 ? alert("Cannot zoom in further") : setFont(font+10)
    }
    const decreaseFont = ()=>{
        font < 50 ? alert("Cannot zoom out further") : setFont(font - 10)
    }
    useEffect(() => {
        rendition.current?.themes.fontSize(font + '%')
    }, [font])


    const rendition = useRef<Rendition | undefined>(undefined)
    const toc = useRef<NavItem[]>([])

    return (
        <div className="flex flex-col h-full max-h-full justify-start items-center overflow-auto">
            <Read 
                title="" 
                actions={<>
                    <div className='flex gap-3'>
                        <div className=''>{page}</div>
                        <div className='flex gap-2 justify-center items-center'>
                            <FontAwesomeIcon icon={faMagnifyingGlassPlus} size='lg' className='hover:cursor-pointer text-gray-400 hover:text-gray-600'  onClick={() => increaseFont()}  />               
                            <span className=''>{font + "%"}</span>
                            <FontAwesomeIcon icon={faMagnifyingGlassMinus} size='lg' className='hover:cursor-pointer text-gray-400 hover:text-gray-600'  onClick={() => decreaseFont()}  />               
                        </div>
                        
                    </div>
                </>}>
                <div style={{ height: "80vh", width: "90vw" }}>
                    <Reader
                        title='BookTitle'
                        showToc={true}
                        url={bookPath}
                        location={location}
                        

                        tocChanged={(_toc) => (toc.current = _toc)}
                        locationChanged={(loc: string) => {
                            setLocation(loc)
                            if (rendition.current && toc.current) {
                                const { displayed, href } = rendition.current.location.start
                                const chapter = toc.current.find((item) => item.href === href)
                                setPage(`Page ${displayed.page} of ${displayed.total}`)
                                // setPage(`Page ${displayed.page} of ${displayed.total} in chapter ${chapter ? chapter.label : 'n/a'}`)
                            }
                        }}
                        getRendition={(_rendition: Rendition) => {
                            rendition.current = _rendition
                            _rendition.hooks.content.register((contents: Contents) => {
                                const body = contents.window.document.querySelector('body')
                                if (body) {
                                    body.oncontextmenu = () => {
                                        return false
                                    }
                                }
                            })
                            rendition.current.themes.fontSize(font + '%')
                        }}
                    />
                </div>
            </Read>
        </div>
    );
};

export default Book; 