// TableOfContents.tsx
import React, { useEffect, type KeyboardEventHandler } from "react";
import { SearchStyle as defaultSearchStyles, type ISearchStyle } from "./style";
import { useContent, useReader, useSearch } from "../../lib/hooks/useReaderContext";
import { ContentList } from "../../lib/hooks/useReaderState/useContentState";
import { convert } from "html-to-text";
import { MdOutlineSearch } from "react-icons/md";
import { SearchItem } from "../../lib/components/SearchItem";

interface ISearchProps {
	searchStyle?: ISearchStyle;
}

export const Search: React.FC<ISearchProps> = ({
	searchStyle = defaultSearchStyles,
}) => {
	const { book } = useReader();
	const { searchContents } = useContent();
	const { searchText, setSearchText, searches, setSearches } = useSearch();

	const onSearchBookContents = async () => {
		const matches = searchContents(searchText);
		setSearches(matches);
	};

	const handleKeyPress: KeyboardEventHandler<HTMLInputElement> = (e) => {
		const key = e.key;
		if (key === "Enter") {
			onSearchBookContents();
		}
	};

	const { setContents } = useContent();

	useEffect(() => {
		if (book) {
			const loadContents = async () => {
				// book.spine should be accessible as we already await for book.ready in useReader
				book.loaded?.spine.then(async (spine) => {
					const contents: ContentList = [];

					for (let item of (spine as any).items) {
						if (!item.href) continue;

						const doc = await book.load(item.href);
						const innerHTML = (doc as Document).documentElement
							.innerHTML;
						const innerText = convert(innerHTML);

						contents.push({
							href: item.href,
							text: innerText.split(/\n+/),
						});
					}
					setContents(contents);
				});
			};
			loadContents();
		}
	}, [book, setContents]);

	return (
		<div className="h-full overflow-hidden flex flex-col">
			<p className="font-semibold text-lg text-center py-2">
				Search Content
			</p>

			<div className="px-4 py-2">
				<div className="pb-2 relative">
					<input
						type="text"
						placeholder="Type here"
						onChange={(e) => setSearchText(e.target.value)}
						onKeyPress={handleKeyPress}
						className="border-2 border-gray-300 focus:border-gray-500 outline-none w-full p-2 pr-12 rounded-md "
						//   style={{ border: '1px solid red', width: '50px' }}
					/>

					<MdOutlineSearch
						size={30}
						onClick={onSearchBookContents}
						className="absolute right-2 top-2 cursor-pointer text-gray-500 hover:text-gray-700"
					/>
				</div>
				<p>Result: Total {searches.length} Record</p>
			</div>
			<div className="p-4 flex-grow overflow-auto">
				{searches?.map((item, i) => (
					<SearchItem key={i} item={item} />
				))}
				{searches.length === 0 && <div>Search Something</div>}
			</div>
		</div>
	);
};
