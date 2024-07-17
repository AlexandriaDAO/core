import React from "react";

import { type NavItem } from "epubjs";
import {
	TocItemStyle as defaultTocItemStyles,
	type ITocItemStyle,
} from "./style";
import { useReader, useSidebar } from "../../hooks/useReaderContext";

type TocItemProps = {
	tocItem: NavItem;
	tocItemStyles?: ITocItemStyle;
};

export const TocItem = ({
	tocItem,
	tocItemStyles = defaultTocItemStyles,
}: TocItemProps) => {
	const { rendition } = useReader();
	const { setSidebar } = useSidebar();

	const handleTocItemClick = (i: NavItem) => {
		rendition.current && rendition.current.display(i.href);
		setSidebar(null);
	};

	return (
		<div style={tocItemStyles.item}>
			<button
				onClick={() => handleTocItemClick(tocItem)}
				style={tocItemStyles.itemButton}
				className="text-white hover:text-gray-300 px-0 py-1 "
			>
				{tocItem.label}
			</button>
			{tocItem.subitems && tocItem.subitems.length > 0 && (
				<div className="pl-3 pb-0">
					{tocItem.subitems.map((item, i) => (
						<TocItem key={i} tocItem={item} />
					))}
				</div>
			)}
		</div>
	);
};
