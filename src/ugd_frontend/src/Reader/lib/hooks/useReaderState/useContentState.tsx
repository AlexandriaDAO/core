// useReaderState.tsx

import { Dispatch, SetStateAction, useState } from "react";

export type Content = {
	href: string;
	text: string[];
};

export type ContentList = Array<Content>;

export type SearchItemObject = {
	paragraph: string;
	href: string;
};
export type Searches = Array<SearchItemObject>;

export interface searchContentsFn {
	// (annotation: Omit<AnnotationItemObject, "time">): void;
	(searchString: string): Searches;
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
	): Searches => {
		const regexp = new RegExp(searchString, "ig");

		let res: Searches = [];
		for (let content of contents) {
			for (let paragraph of content.text) {
				if (paragraph.match(regexp) !== null) {
					let searchItem: SearchItemObject = {
						paragraph,
						href: content.href,
					};
					res.push(searchItem);
				}
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
