// src/Reader/index.tsx
import React, { useEffect } from "react";
import { ReaderStyle as defaultStyles, type IReaderStyle } from "./style";
import { Sidebar } from "./Sidebar";

import ContentView from "./ContentView";

import { useReader, useSidebar } from "./lib/hooks/useReaderContext";

import { GoLinkExternal } from "react-icons/go";
import { Drawer } from "./Drawer";
import { Toolbar } from "./Toolbar";

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
	const { url, setUrl, book, rendition, bookLocation } = useReader();

	// bookLocation is used for Full Screen

	const { sidebar } = useSidebar();

	useEffect(() => {
		if (url) return;

		setUrl(bookUrl);

		return () => {
			try {
				if (rendition) {
					rendition.current?.destroy()
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
		<div className="md:aspect-video aspect-[3/4] w-full h-full flex gap-1 overflow-hidden bg-white rounded relative" ref={bookLocation}>
			{showToolbar && <Toolbar />}
			{showSidebar && <Sidebar />}
			<div style={readerStyles.container} className="rounded w-full h-full">
				<div style={readerStyles.readerArea}>
					<ContentView />
				</div>
			</div>
		</div>
	);
};
