// src/Reader/index.tsx
import React, { useEffect, useState } from "react";
import { ReaderStyle as defaultStyles, type IReaderStyle } from "./style";

import ContentView from "./ContentView";

import { useCardList, useReader, useSetting, useSidebar } from "./lib/hooks/useReaderContext";

import { IoCloseOutline, IoMenuOutline } from "react-icons/io5";
import { MdOutlineSettings } from "react-icons/md";
import { HiOutlineMinus, HiOutlinePlus } from "react-icons/hi";

import BookmarkToggle from "./lib/components/BookmarkToggle";
import FullScreenToggle from "./lib/components/FullScreenToggle";
import SpreadToggle from "./lib/components/SpreadToggle";
import ContentList from "./ContentList";
import { Setting } from "./Setting";
import { CardList } from "./CardList";
import FontSizeButton from "./lib/components/FontSizeButton";

export type IReaderProps = {
	title?: string;
	readerStyles?: IReaderStyle;

	bookUrl?: string;
	// epubOptions?: Object;

	showSidebar?: boolean;
	showToolbar?: Boolean;

	external?: (() => void) | null;
};

export const Reader: React.FC<IReaderProps> = ({
	title = "Title",
	readerStyles = defaultStyles,

	// bookUrl = "https://uncensoredgreatsebooks.s3.us-east-2.amazonaws.com/Benjamin_Franklin/Benjamin_Franklin@@The_Complete_Works_in_Philosophy,_Politics_and_Morals_of_the_late_Dr._Benjamin_Franklin,_Vol._1_[of_3].epub",
	// bookUrl = "https://bafybeibfamdu25bcximdtzjlvhis3jygzg3mibymeel54yl4e2e2gnoh5q.ipfs.w3s.link",
	bookUrl = "test.epub",

	showSidebar = true,
	showToolbar = true,
	external = null,
}: IReaderProps) => {
	const { url, setUrl, book, rendition, bookLocation, currentPage, totalPages, percentage, metadata } = useReader();

	// bookLocation is used for Full Screen

	const { sidebar } = useSidebar();
	const { showSetting, setShowSetting } = useSetting();
	const { showCardList, setShowCardList } = useCardList();

	useEffect(() => {
		if (url) return;

		setUrl(bookUrl);

		return () => {
			try {
				if (rendition) {
					rendition.current?.destroy();
				}

				if (book) {
					book.destroy();
					console.log("Book was destroyed");
				} else {
					console.log("No Book to destroy");
				}
			} catch {
				console.error("Error Destroying book");
			}
		};
	}, []);

	return (
		<div
			className="md:aspect-video aspect-[3/4] w-full h-full flex flex-col gap-0.5 overflow-hidden bg-white rounded relative"
			ref={bookLocation}
		>
			<div className="w-full bg-[#393939] flex items-center justify-between p-3">
				<div className="flex gap-1 items-center justify-between">
					<FullScreenToggle />
				</div>
				{metadata &&  <span className="font-syne text-xl text-white">{metadata.title}</span> }
				{showCardList ? (
					<IoCloseOutline
						size={30}
						color="white"
						onClick={() => setShowCardList(false)}
						className="z-10 cursor-pointer border border-solid p-1 rounded-full"
					/>
				) : (
					<IoMenuOutline
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
				<div style={readerStyles.readerArea} className={`${showSetting||showCardList ? 'filter blur-sm':''}`}>
					<ContentView />
				</div>
				<CardList />
			</div>

			<div className="w-full bg-[#393939] flex justify-between p-3">
				<div className="flex items-center justify-between gap-4">
					{showSetting ? (
						<IoCloseOutline
							size={30}
							color="white"
							onClick={() => setShowSetting(false)}
							className="z-10 cursor-pointer border border-solid p-1 rounded-full"
						/>
					) : (
						<MdOutlineSettings
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
						<div className="font-roboto-condensed text-base text-white	">
							{currentPage} of {totalPages}
						</div>
						<div className="font-roboto-condensed text-base text-[#C1C1C1]">
							{percentage}%
						</div>
					</div>
					<div className="bg-[#828282] rounded-full h-3">
						<div
							className="bg-[#F6F930] h-3 rounded-full"
							style={{ width: percentage+"%" }}
						></div>
					</div>
				</div>

				<div className="flex items-center justify-between gap-4">
					{/* <div className="flex items-center justify-between gap-1">
						<BookmarkToggle />
					</div> */}

					<SpreadToggle />
				</div>
			</div>
			{/* {showSidebar && <Sidebar />} */}
		</div>
	);
};
