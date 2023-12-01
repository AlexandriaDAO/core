import React from "react";

import {
	SearchItemStyle as defaultSearchItemStyles,
	type ISearchItemStyle,
} from "./style";

import { SearchItemObject } from "../../hooks/useReaderState/useContentState";
import { useReader, useSearch, useSidebar } from "../../hooks/useReaderContext";

type ISearchItemProps = {
	item: SearchItemObject;
	searchItemStyles?: ISearchItemStyle;
};

export const SearchItem: React.FC<ISearchItemProps> = ({
	item,
	searchItemStyles = defaultSearchItemStyles,
}: ISearchItemProps) => {
	const { rendition, setCurrentLocation } = useReader();
	const { setSidebar } = useSidebar();
	const { searchText } = useSearch();

	// onListItemClick(
	// 	item?.href,
	// 	item?.paragraph
	// );

	const handleSearchItemClick = async () => {
		if (!rendition.current) return;
		await rendition.current.display(item.href);

		// to mark the text inside book view
		// not fully functional
		const win = document.querySelector("iframe")?.contentWindow;
		if (win) {
			const body = win.document.documentElement.querySelector("body");
			if (body) {
				const regExp = new RegExp(
					`(<[\w\d]+>)?.*(${searchText}).*<\/?[\w\d]+>`,
					"ig"
				);
				body.innerHTML = body.innerHTML.replace(
					regExp,
					(match, sub1, sub2) => {
						return match.replace(sub2, `<mark>${sub2}</mark>`);
					}
				);

				// body.innerHTML = body.innerHTML.replace(
				//   paragraph,
				//   `<span class="highlight" style="color:orange;">${paragraph}</span>`
				// )
				// const regExp = new RegExp(searchText, 'ig')
				// body.innerHTML = body.innerHTML.replace(paragraph, `<span class="highlight">${paragraph}</span>`)
				// body.innerHTML = body.innerHTML.replace(regExp, (match) => {
				//   return `<mark>${match}</mark>`
				// })
			}
		}

		setSidebar(null);

		setCurrentLocation(rendition.current.location);
	};

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
					__html:
						item && item.paragraph
							? item.paragraph.replace(
									new RegExp(searchText, "ig"),
									'<span style="color: red;">' +
										searchText +
										"</span>"
							  )
							: "",
				}}
			></p>
		</div>
	);
};
