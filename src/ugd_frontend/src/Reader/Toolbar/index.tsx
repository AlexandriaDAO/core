// src/Toolbar/index.tsx
import React, { useState } from "react";

import {
	ToolbarStyle as defaultToolbarStyles,
	type IToolbarStyle,
} from "./style";
import BookmarkToggle from "../lib/components/BookmarkToggle";
import FullScreenToggle from "../lib/components/FullScreenToggle";
import ThemeToggle from "../lib/components/ThemeToggle";
import ScrollToggle from "../lib/components/ScrollToggle";
import { CiMenuKebab } from "react-icons/ci";
import { useReader } from "../lib/hooks/useReaderContext";

interface ToolbarProps {
	title: string;
	toolbarStyles?: IToolbarStyle;
}

export const Toolbar: React.FC<ToolbarProps> = ({
	toolbarStyles = defaultToolbarStyles,
	title = "Title",
}) => {
	const [visible, setVisible] = useState(false);
	const { fullScreen } = useReader();

	return (
		<>
			{visible ? (
				<div
					onMouseLeave={() => setVisible(false)}
					className="absolute inset-0 z-50 h-12 flex justify-between items-center p-3  "
				>
					<div className="flex-grow">
						<h3 className="font-semibold text-lg capitalize text-center">
							{title}
						</h3>
					</div>
					<div className="flex justify-between items-center gap-2">
						<BookmarkToggle />
						<FullScreenToggle />
						
						<ThemeToggle />
						<ScrollToggle />
					</div>
				</div>
			) : (
				<div
					onMouseEnter={() => setVisible(true)}
					className="absolute inset-0 z-50 h-12 bg-transparent flex justify-end items-center p-3  "
				>
					<CiMenuKebab /> 
				</div>
			)}
		</>
	);
};
