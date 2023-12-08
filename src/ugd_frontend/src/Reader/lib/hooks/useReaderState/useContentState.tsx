// useReaderState.tsx

import { EpubCFI } from "epubjs";
import { Dispatch, SetStateAction, useState } from "react";

export type Content = {
	text:string,   //paragraph text
	cfi:EpubCFI,   
};

export type ContentList = Array<Content>;

export interface searchContentsFn {
	// (annotation: Omit<AnnotationItemObject, "time">): void;
	(searchString: string): ContentList;
}

// Define the shape of the context data
export interface IContentState {
	contents: ContentList;

	setContents: Dispatch<SetStateAction<ContentList>>;
	searchContents: searchContentsFn;
}

export const useContentState = (): IContentState => {
	const [contents, setContents] = useState<ContentList>([]);

	const searchContents: searchContentsFn = (
		searchString: string
	): ContentList => {
		const regexp = new RegExp(searchString, "ig");

		let res: ContentList = [];
		for (let content of contents) {
			if (content.text.match(regexp) !== null) {
				let searchItem: Content = {
					text: content.text,
					cfi: content.cfi,
				};
				res.push(searchItem);
			}
		}

		return res;
	};

	return {
		contents,
		setContents,
		searchContents,
	};
};
