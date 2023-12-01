// src/Toolbar/index.tsx
import React from "react";

import {
	ToolbarStyle as defaultToolbarStyles,
	type IToolbarStyle,
} from "./style";
import BookmarkToggle from "../lib/components/BookmarkToggle";
import FullScreenToggle from "../lib/components/FullScreenToggle";
import ThemeToggle from "../lib/components/ThemeToggle";
import ScrollToggle from "../lib/components/ScrollToggle";

interface ToolbarProps {
	title: string;
	toolbarStyles?: IToolbarStyle;
}

export const Toolbar: React.FC<ToolbarProps> = ({
	toolbarStyles = defaultToolbarStyles,
	title = "Title",
}) => {
	return (
		<div className="h-12 border border-stone-300 bg-stone-100 shadow-sm rounded flex justify-between items-center p-3 ">
			<div className="flex-grow">
				<h3 className="font-semibold text-lg capitalize">{title}</h3>
			</div>
			<div className="flex justify-between items-center gap-2">
				<BookmarkToggle />
				<FullScreenToggle />
				<ThemeToggle />
				<ScrollToggle />
			</div>
		</div>
	);
};
