// src/Drawer/index.tsx
import React from "react";

import { DrawerStyle as defaultDrawerStyles, type IDrawerStyle } from "./style";
import { TableOfContents } from "./TableOfContents";

import { Setting } from "./Setting";
import { Bookmarks } from "./Bookmarks";
import { Annotations } from "./Annotations";
import { Search } from "./Search";
import { Tabs } from "../lib/hooks/useSidebarState";
import { useSidebar } from "../lib/hooks/useReaderContext";

import { IoCloseCircleOutline } from "react-icons/io5";

interface DrawerProps {
	drawerStyles?: IDrawerStyle;
}

export const Drawer: React.FC<DrawerProps> = ({
	drawerStyles = defaultDrawerStyles,
}) => {
	const { sidebar, setSidebar } = useSidebar();

	const renderTabContent = () => {
		switch (sidebar) {
			case Tabs.TableOfContents:
				return <TableOfContents />;
			case Tabs.Bookmarks:
				return <Bookmarks />;
			case Tabs.Annotations:
				return <Annotations />;
			case Tabs.Search:
				return <Search />;
			case Tabs.Settings:
				return <Setting />;
			default:
				return null;
		}
	};

	return (
		<div>
			<div className="absolute inset-0 z-10 flex p-2">
				<div className="absolute inset-0 bg-black opacity-50"></div>
				<div className="bg-gradient-to-t from-indigo-100 to-indigo-50 text-indigo-800 w-10/12 sm:w-8/12 md:w-4/12 rounded-md shadow-md z-20 p-1 text-base">
					{renderTabContent()}
				</div>
				<div
					className="flex-grow flex justify-end cursor-pointer z-20"
					onClick={() => setSidebar(null)}
				>
					<IoCloseCircleOutline
						size={40}
						onClick={() => setSidebar(null)}
						className="md:m-3 sm:m-1 text-gray-100 hover:text-gray-300 sm:hidden"
					/>
				</div>
			</div>
		</div>
	);
};
