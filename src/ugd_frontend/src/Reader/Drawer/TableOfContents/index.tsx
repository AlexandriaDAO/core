// TableOfContents.tsx
import React from "react";
import {
	TableOfContentsStyle as defaultTableOfCotentsStyles,
	type ITableOfContentsStyle,
} from "./style";
import { useReader } from "../../lib/hooks/useReaderContext";
import { TocItem } from "../../lib/components/TocItem";

interface TableOfContentsProps {
	tocStyles?: ITableOfContentsStyle;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
	tocStyles = defaultTableOfCotentsStyles,
}) => {
	const { chapters } = useReader();

	return (
		<div className="h-full overflow-hidden flex flex-col ">
			<p className="font-semibold text-lg text-center py-2 ">
				Table Of Contents
			</p>
			<div style={tocStyles.toc} className="p-4 flex-grow overflow-auto">
				{chapters?.map((item, i) => (
					<TocItem key={i} tocItem={item} />
				))}
			</div>
		</div>
	);
};
