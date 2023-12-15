// src/Toolbar/index.tsx
import React, { useEffect, useRef, useState } from "react";

import {
	ToolbarStyle as defaultToolbarStyles,
	type IToolbarStyle,
} from "./style";
import BookmarkToggle from "../lib/components/BookmarkToggle";
import FullScreenToggle from "../lib/components/FullScreenToggle";
import ThemeToggle from "../lib/components/ThemeToggle";
import ScrollToggle from "../lib/components/ScrollToggle";
import { FiChevronsDown, FiChevronsUp } from "react-icons/fi";

interface ToolbarProps {
	toolbarStyles?: IToolbarStyle;
}

export const Toolbar: React.FC<ToolbarProps> = ({
	toolbarStyles = defaultToolbarStyles,
}) => {
	const [visible, setVisible] = useState(false);	

	return (
		<div
			onMouseEnter={() => setVisible(true)}
			onMouseLeave={() => setVisible(false)}
			className="absolute z-10 flex flex-col justify-center items-center right-1 top-1 w-fit bg-indigo-50 h-fit border border-solid rounded-full"
		>
			<FiChevronsDown size={30} onClick={() => setVisible(true)} className={`cursor-pointer text-gray-500 transition-all duration-300 ${visible ? 'opacity-0 invisible h-0' : 'opacity-100 visible h-auto'}`}/> 
			<FiChevronsUp size={30} onClick={() => setVisible(false)} className={`cursor-pointer text-gray-500 transition-all duration-300 ${!visible ? 'opacity-0 invisible h-0' : 'opacity-100 visible h-auto pb-2'}`}/> 

			<div className={`flex flex-col justify-between items-center gap-2 transition-all duration-300 ease-in-out origin-top transform ${visible ? 'translate-y-0 opacity-100 visible max-h-36' : '-translate-y-10 opacity-0 invisible max-h-0'}`}>
				<BookmarkToggle />
				<FullScreenToggle />
				<ThemeToggle />
				<ScrollToggle />
			</div>
		</div>
	);
};
