// src/Reader/index.tsx
import React, { useEffect } from "react";
import { ReaderStyle as defaultStyles, type IReaderStyle } from "./style";

import { useSelector, useDispatch } from 'react-redux';
import { RootState } from "@/store";
import { setSelectedBook, setIsModalOpen } from "../home/homeSlice";

import ContentView from "./ContentView";

import { useCardList, useReader, useSetting, useSidebar } from "./lib/hooks/useReaderContext";

import BookmarkToggle from "./lib/components/BookmarkToggle";
import FullScreenToggle from "./lib/components/FullScreenToggle";
import SpreadToggle from "./lib/components/SpreadToggle";
import ContentList from "./ContentList";
import { Setting } from "./Setting";
import { CardList } from "./CardList";
import FontSizeButton from "./lib/components/FontSizeButton";
import { EpubCFI } from "epubjs";
import { AlignJustify, Settings, X } from "lucide-react";

export type IReaderProps = {
    title?: string;
    readerStyles?: IReaderStyle;
    bookUrl?: string;
    showSidebar?: boolean;
    showToolbar?: Boolean;
    cfi?: string;
    external?: (() => void) | null;
};

export const Reader: React.FC<IReaderProps> = ({
    title = "Title",
    readerStyles = defaultStyles,
    bookUrl = "test.epub",
    showSidebar = true,
    showToolbar = true,
    cfi = '',
    external = null,
}: IReaderProps) => {
    const { url, setUrl, book, rendition, firstPageLoaded, setFirstPageLoaded, setIsLoaded, setCurrentLocation, bookLocation, currentPage, totalPages, percentage, metadata } = useReader();

    const { sidebar } = useSidebar();
    const { showSetting, setShowSetting } = useSetting();
    const { showCardList, setShowCardList } = useCardList();

    useEffect(() => {
		// if (url) return;
		setUrl(bookUrl);
        return () => {
        	try {
        		if (rendition&& rendition.current) {
        			rendition.current.destroy();
                    console.log('Rendition was destroyed');
        		}else{
                    console.log('No Rendition to destroy');
                }
        		if (book) {
        			book.destroy();
        			console.log("Book was destroyed");
        		} else {
        			console.log("No Book to destroy");
        		}

                setCurrentLocation(undefined);
                setIsLoaded(false);
                setFirstPageLoaded(false);
        	} catch {
        		console.error("Error Destroying book");
        	}
        };
	}, [bookUrl]);

    useEffect(() => {
        if (!rendition || !rendition.current) return;
        if (!firstPageLoaded) return;
        if (cfi === '') return;

        rendition.current.display(cfi).then(() => {
            if (!rendition || !rendition.current) return;

            setCurrentLocation(rendition.current.location);

            // Highlight the text
            const range = rendition.current.getRange(cfi);
            if (range && range.startContainer.nodeType === Node.ELEMENT_NODE) {
                (range.startContainer as HTMLElement).style.color = 'red';
            } else {
                console.error('Range not found for CFI:', cfi);
            }
        });
    }, [cfi, firstPageLoaded, setCurrentLocation, rendition]);

    return (
        <div
            className="md:aspect-video aspect-[3/4] w-full h-full flex flex-col gap-0.5 overflow-hidden bg-white rounded relative"
            ref={bookLocation}
        >
            <div className="w-full bg-[#393939] flex items-center justify-between p-3">
                <div className="flex gap-1 items-center justify-between">
                    <FullScreenToggle />
                </div>
                {metadata && <span className="font-syne text-xl text-white">{metadata.title}</span>}
                {showCardList ? (
                    <X
                        size={30}
                        color="white"
                        onClick={() => setShowCardList(false)}
                        className="z-10 cursor-pointer border border-solid p-1 rounded-full"
                    />
                ) : (
                    <AlignJustify
                        className="cursor-pointer border border-solid rounded-full p-1"
                        size={30}
                        color="white"
                        onClick={() => setShowCardList(true)}
                    />
                )}
            </div>
            <div
                style={readerStyles.container}
                className="rounded w-full h-full"
            >
                <Setting />
                <div style={readerStyles.readerArea} className={`${showSetting || showCardList ? 'filter blur-sm' : ''}`}>
                    <ContentView />
                </div>
                <CardList />
            </div>

            <div className="w-full bg-[#393939] flex justify-between p-3">
                <div className="flex items-center justify-between gap-4">
                    {showSetting ? (
                        <X
                            size={30}
                            color="white"
                            onClick={() => setShowSetting(false)}
                            className="z-10 cursor-pointer border border-solid p-1 rounded-full"
                        />
                    ) : (
                        <Settings
                            size={30}
                            color="white"
                            onClick={() => setShowSetting(true)}
                            className="z-10 cursor-pointer border border-solid p-1 rounded-full"
                        />
                    )}
                    <FontSizeButton />
                </div>
                <ContentList />

                <div className="flex-grow max-w-96 flex flex-col gap-1">
                    <div className="flex justify-between">
                        <div className="font-roboto-condensed text-base text-[#C1C1C1]">
                            Pages
                        </div>
                        <div className="font-roboto-condensed text-base text-white">
                            {currentPage} of {totalPages}
                        </div>
                        <div className="font-roboto-condensed text-base text-[#C1C1C1]">
                            {percentage}%
                        </div>
                    </div>
                    <div className="bg-[#828282] rounded-full h-3">
                        <div
                            className="bg-brightyellow h-3 rounded-full"
                            style={{ width: percentage + "%" }}
                        ></div>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <SpreadToggle />
                </div>
            </div>
        </div>
    );
};



















// // With merge conflicts.

// // src/Reader/index.tsx
// import React, { useEffect, useState, useCallback } from "react";
// import { ReaderStyle as defaultStyles, type IReaderStyle } from "./style";

// import { useSelector, useDispatch } from 'react-redux';
// import { RootState } from "@/store";
// import { setSelectedBook, setIsModalOpen } from "../home/homeSlice";

// import ContentView from "./ContentView";

// import { useCardList, useReader, useSetting, useSidebar } from "./lib/hooks/useReaderContext";

// import { IoCloseOutline, IoMenuOutline } from "react-icons/io5";
// import { MdOutlineSettings } from "react-icons/md";
// import { HiOutlineMinus, HiOutlinePlus } from "react-icons/hi";

// import BookmarkToggle from "./lib/components/BookmarkToggle";
// import FullScreenToggle from "./lib/components/FullScreenToggle";
// import SpreadToggle from "./lib/components/SpreadToggle";
// import ContentList from "./ContentList";
// import { Setting } from "./Setting";
// import { CardList } from "./CardList";
// import FontSizeButton from "./lib/components/FontSizeButton";
// import { EpubCFI } from "epubjs";



// export type IReaderProps = {
//     title?: string;
//     readerStyles?: IReaderStyle;

//     bookUrl?: string;
//     // epubOptions?: Object;

//     showSidebar?: boolean;
//     showToolbar?: Boolean;

// <<<<<<< feature/fund-upload-search
// 	cfi?: string;

// 	external?: (() => void) | null;
// =======
//     external?: (() => void) | null;
// >>>>>>> master
// };

// export const Reader: React.FC<IReaderProps> = ({
// 	title = "Title",
// 	readerStyles = defaultStyles,
// 	showSidebar = true,
// 	showToolbar = true,

// 	cfi= '',

// 	external = null,
// }: IReaderProps) => {
// <<<<<<< feature/fund-upload-search
// 	const { url, setUrl, book, rendition, firstPageLoaded, setCurrentLocation, bookLocation, currentPage, totalPages, percentage, metadata } = useReader();
// =======
// 	const dispatch = useDispatch();
// 	const { selectedBook, bookUrl } = useSelector((state: RootState) => state.home);
// 	const { url, setUrl, book, rendition, bookLocation, currentPage, totalPages, percentage, metadata } = useReader();
// >>>>>>> master

// 	const { sidebar } = useSidebar();
// 	const { showSetting, setShowSetting } = useSetting();
// 	const { showCardList, setShowCardList } = useCardList();
	
// 	const hideSelectedBook = useCallback(() => {
// 			dispatch(setSelectedBook(null));
// 			dispatch(setIsModalOpen(false));
// 	}, [dispatch]);

// 	const cleanupBook = useCallback(() => {
// 		try {
// 				if (rendition) {
// 						rendition.current?.destroy();
// 				}

// 				if (book) {
// 						book.destroy();
// 						console.log("Book was destroyed");
// 				} else {
// 						console.log("No Book to destroy");
// 				}
// 		} catch {
// 				console.error("Error Destroying book");
// 		}
// 	}, [book, rendition, hideSelectedBook]);

// 	useEffect(() => {
// 			if (bookUrl && bookUrl !== url) {
// 					cleanupBook();
// 					setUrl(bookUrl);
// 			}
// <<<<<<< feature/fund-upload-search
// 		};
// 	}, []);

// 	useEffect(() => {
// 		// rendition not available
// 		if (!rendition || !rendition.current) return;

// 		// book is not yet loaded
// 		if (!firstPageLoaded) return;

// 		// no default location/cfi is provided
// 		if (cfi == '') return;

// 		rendition.current.display(cfi).then(()=>{
// 			// rendition is not available or maybe destroyed
// 			if(!rendition || !rendition.current) return;

// 			setCurrentLocation(rendition.current.location);

// 			// Highlight the text
// 			const range = rendition.current.getRange(cfi);
// 			if (range && range.startContainer.nodeType === Node.ELEMENT_NODE) {
// 				(range.startContainer as HTMLElement).style.color = 'red';
// 			} else {
// 				console.error('Range not found for CFI:', cfi);
// 			}
// 		});

// 	}, [cfi, firstPageLoaded, setCurrentLocation]);

// 	return (
// 		<div
// 			className="md:aspect-video aspect-[3/4] w-full h-full flex flex-col gap-0.5 overflow-hidden bg-white rounded relative"
// 			ref={bookLocation}
// 		>
// 			<div className="w-full bg-[#393939] flex items-center justify-between p-3">
// 				<div className="flex gap-1 items-center justify-between">
// 					<FullScreenToggle />
// 				</div>
// 				{metadata &&  <span className="font-syne text-xl text-white">{metadata.title}</span> }
// 				{showCardList ? (
// 					<IoCloseOutline
// 						size={30}
// 						color="white"
// 						onClick={() => setShowCardList(false)}
// 						className="z-10 cursor-pointer border border-solid p-1 rounded-full"
// 					/>
// 				) : (
// 					<IoMenuOutline
// 						className="cursor-pointer border border-solid rounded-full p-1"
// 						size={30}
// 						color="white"
// 						onClick={() => setShowCardList(true)}
// 					/>
// 				)}
// 			</div>
// 			<div
// 				style={readerStyles.container}
// 				className="rounded w-full h-full"
// 			>
// 				<Setting />
// 				<div style={readerStyles.readerArea} className={`${showSetting||showCardList ? 'filter blur-sm':''}`}>
// 					<ContentView />
// 				</div>
// 				<CardList />
// 			</div>

// 			<div className="w-full bg-[#393939] flex justify-between p-3">
// 				<div className="flex items-center justify-between gap-4">
// 					{showSetting ? (
// 						<IoCloseOutline
// 							size={30}
// 							color="white"
// 							onClick={() => setShowSetting(false)}
// 							className="z-10 cursor-pointer border border-solid p-1 rounded-full"
// 						/>
// 					) : (
// 						<MdOutlineSettings
// 							size={30}
// 							color="white"
// 							onClick={() => setShowSetting(true)}
// 							className="z-10 cursor-pointer border border-solid p-1 rounded-full"
// 						/>
// 					)}
// 					<FontSizeButton />

// 				</div>
// 				<ContentList />

// 				<div className="flex-grow max-w-96 flex flex-col gap-1">
// 					<div className="flex justify-between">
// 						<div className="font-roboto-condensed text-base text-[#C1C1C1]">
// 							Pages
// 						</div>
// 						<div className="font-roboto-condensed text-base text-white	">
// 							{currentPage} of {totalPages}
// 						</div>
// 						<div className="font-roboto-condensed text-base text-[#C1C1C1]">
// 							{percentage}%
// 						</div>
// 					</div>
// 					<div className="bg-[#828282] rounded-full h-3">
// 						<div
// 							className="bg-brightyellow h-3 rounded-full"
// 							style={{ width: percentage+"%" }}
// 						></div>
// 					</div>
// 				</div>

// 				<div className="flex items-center justify-between gap-4">
// 					{/* <div className="flex items-center justify-between gap-1">
// 						<BookmarkToggle />
// 					</div> */}

// 					<SpreadToggle />
// 				</div>
// 			</div>
// 			{/* {showSidebar && <Sidebar />} */}
// 		</div>
// 	);
// =======
// 	}, [bookUrl, url, setUrl, cleanupBook]);

// 	useEffect(() => {
// 			return () => {
// 					cleanupBook();
// 			};
// 	}, [cleanupBook]);

// 	useEffect(() => {
// 			if (url) return;

// 			if (bookUrl) {
// 					setUrl(bookUrl);
// 			} else if (selectedBook) {
// 					const newBookUrl = `https://node1.irys.xyz/${selectedBook.transactionId}`;
// 					dispatch(setSelectedBook({ ...selectedBook, bookUrl: newBookUrl }));
// 					setUrl(newBookUrl);
// 			}

// 			return () => {
// 					cleanupBook();
// 			};
// 	}, [selectedBook, bookUrl, url, setUrl, dispatch]);

//     return (
//         <div
//             className="md:aspect-video aspect-[3/4] w-full h-full flex flex-col gap-0.5 overflow-hidden bg-white rounded relative"
//             ref={bookLocation}
//         >
//             <div className="w-full bg-[#393939] flex items-center justify-between p-3">
//                 <div className="flex gap-1 items-center justify-between">
//                     <FullScreenToggle />
//                 </div>
//                 {metadata &&  <span className="font-syne text-xl text-white">{metadata.title}</span> }
//                 {showCardList ? (
//                     <IoCloseOutline
//                         size={30}
//                         color="white"
//                         onClick={() => setShowCardList(false)}
//                         className="z-10 cursor-pointer border border-solid p-1 rounded-full"
//                     />
//                 ) : (
//                     <IoMenuOutline
//                         className="cursor-pointer border border-solid rounded-full p-1"
//                         size={30}
//                         color="white"
//                         onClick={() => setShowCardList(true)}
//                     />
//                 )}
//             </div>
//             <div
//                 style={readerStyles.container}
//                 className="rounded w-full h-full"
//             >
//                 <Setting />
//                 <div style={readerStyles.readerArea} className={`${showSetting||showCardList ? 'filter blur-sm':''}`}>
//                     <ContentView />
//                 </div>
//                 <CardList />
//             </div>

//             <div className="w-full bg-[#393939] flex justify-between p-3">
//                 <div className="flex items-center justify-between gap-4">
//                     {showSetting ? (
//                         <IoCloseOutline
//                             size={30}
//                             color="white"
//                             onClick={() => setShowSetting(false)}
//                             className="z-10 cursor-pointer border border-solid p-1 rounded-full"
//                         />
//                     ) : (
//                         <MdOutlineSettings
//                             size={30}
//                             color="white"
//                             onClick={() => setShowSetting(true)}
//                             className="z-10 cursor-pointer border border-solid p-1 rounded-full"
//                         />
//                     )}
//                     <FontSizeButton />

//                 </div>
//                 <ContentList />

//                 <div className="flex-grow max-w-96 flex flex-col gap-1">
//                     <div className="flex justify-between">
//                         <div className="font-roboto-condensed text-base text-[#C1C1C1]">
//                             Pages
//                         </div>
//                         <div className="font-roboto-condensed text-base text-white    ">
//                             {currentPage} of {totalPages}
//                         </div>
//                         <div className="font-roboto-condensed text-base text-[#C1C1C1]">
//                             {percentage}%
//                         </div>
//                     </div>
//                     <div className="bg-[#828282] rounded-full h-3">
//                         <div
//                             className="bg-brightyellow h-3 rounded-full"
//                             style={{ width: percentage+"%" }}
//                         ></div>
//                     </div>
//                 </div>

//                 <div className="flex items-center justify-between gap-4">
//                     {/* <div className="flex items-center justify-between gap-1">
//                         <BookmarkToggle />
//                     </div> */}

//                     <SpreadToggle />
//                 </div>
//             </div>
//             {/* {showSidebar && <Sidebar />} */}
//         </div>
//     );
// >>>>>>> master
// };





