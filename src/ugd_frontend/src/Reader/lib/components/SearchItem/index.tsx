import React from "react";

import {
	SearchItemStyle as defaultSearchItemStyles,
	type ISearchItemStyle,
} from "./style";

import { Content } from "../../hooks/useReaderState/useContentState";
import { useReader, useSearch, useSidebar } from "../../hooks/useReaderContext";
import { clipParagraph, highlightText } from "../../utils/search";

type ISearchItemProps = {
	item: Content;
	searchItemStyles?: ISearchItemStyle;
};

export const SearchItem: React.FC<ISearchItemProps> = ({
	item,
	searchItemStyles = defaultSearchItemStyles,
}: ISearchItemProps) => {
	const { rendition, setCurrentLocation } = useReader();
	const { setSidebar } = useSidebar();
	const { searchText } = useSearch();

	const handleSearchItemClick = async () => {
		if (!rendition.current) return;
		await rendition.current.display(item.cfi.toString());
		setSidebar(null);
		setCurrentLocation(rendition.current.location);

		// snippet to highlight the search needle

		// const iframe = document.querySelector("iframe");
		// if (!iframe) return;
	
		// const win = iframe.contentWindow;
		// if (!win) return;
	
		// const body = win.document.body;
		// if (!body) return;
	
		// // Function to recursively highlight text in a node
		// highlightText(body,searchText);
	};

	const formatedText = () => {
		return clipParagraph(
			item.text.replace( new RegExp(searchText, "ig"), '<span style="color: red;">' + searchText + "</span>"
	  	), searchText)
	}
	return (
		<div
			style={searchItemStyles.item}
			className="py-2 "
			onClick={handleSearchItemClick}
		>
			<p
				style={searchItemStyles.itemButton}
				className="text-gray-500 hover:text-gray-700 px-0 border-b border-b-gray-500"
				dangerouslySetInnerHTML={{
					__html: item && item.text ? formatedText() : ""
				}}
			></p>
		</div>
	);
};
