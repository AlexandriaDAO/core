// src/Sidebar/index.tsx
import React from "react";

import {
	SidebarStyle as defaultSidebarStyles,
	type ISidebarStyle,
} from "./style";
import { Tabs } from "../lib/hooks/useSidebarState";
import { useSidebar } from "../lib/hooks/useReaderContext";

import { MdMenuBook } from "react-icons/md";
import { MdOutlineBookmarks } from "react-icons/md";
import { HiOutlineAnnotation } from "react-icons/hi";
import { MdOutlineSearch } from "react-icons/md";
import { MdOutlineSettings } from "react-icons/md";

import { SidebarItem } from "../lib/components/SidebarItem";

interface SidebarProps {
	sidebarStyles?: ISidebarStyle;
}

export const Sidebar: React.FC<SidebarProps> = ({
	sidebarStyles = defaultSidebarStyles,
}) => {
	const { sidebar, setSidebar } = useSidebar();

	const handleSidebarClick = (tab: Tabs) => {
		if (sidebar === tab) {
			setSidebar(null);
		} else {
			setSidebar(tab);
		}
	};

	return (
		<ul className=" px-1.5 border border-stone-300 bg-stone-100 rounded h-full flex flex-col shadow-sm items-center justify-center">
			<SidebarItem
				icon={
					<MdMenuBook
						size={30}
						onClick={() => handleSidebarClick(Tabs.TableOfContents)}
					/>
				}
				active={sidebar === Tabs.TableOfContents ? true : false}
				tooltip="Table Of Contents"
			/>
			<SidebarItem
				icon={
					<MdOutlineBookmarks
						size={30}
						onClick={() => handleSidebarClick(Tabs.Bookmarks)}
					/>
				}
				active={sidebar === Tabs.Bookmarks ? true : false}
				tooltip="Bookmarks"
			/>
			<SidebarItem
				icon={
					<HiOutlineAnnotation
						size={30}
						onClick={() => handleSidebarClick(Tabs.Annotations)}
					/>
				}
				active={sidebar === Tabs.Annotations ? true : false}
				tooltip="Annotations"
			/>
			<SidebarItem
				icon={
					<MdOutlineSearch
						size={30}
						onClick={() => handleSidebarClick(Tabs.Search)}
					/>
				}
				active={sidebar === Tabs.Search ? true : false}
				tooltip="Search"
			/>
			<SidebarItem
				icon={
					<MdOutlineSettings
						size={30}
						onClick={() => handleSidebarClick(Tabs.Settings)}
					/>
				}
				active={sidebar === Tabs.Settings ? true : false}
				tooltip="Settings"
			/>
		</ul>
	);
};
