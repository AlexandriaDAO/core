// src/Sidebar/index.tsx
import React, { useEffect, useState } from "react";

import {
	SidebarStyle as defaultSidebarStyles,
	type ISidebarStyle,
} from "./style";
import { Tabs } from "../lib/hooks/useSidebarState";
import { useSidebar } from "../lib/hooks/useReaderContext";

import { SidebarItem } from "../lib/components/SidebarItem";
import { Drawer } from "../Drawer";
import { AlignJustify, Bookmark, BookOpenCheck, CircleX, MessageSquare, Search, Settings } from "lucide-react";

interface SidebarProps {
	sidebarStyles?: ISidebarStyle;
}

export const Sidebar: React.FC<SidebarProps> = ({
	sidebarStyles = defaultSidebarStyles,
}) => {
	const [visible, setVisible] = useState(false);
	const { sidebar, setSidebar } = useSidebar();

	const handleSidebarClick = (tab: Tabs) => {
		if (sidebar === tab) {
			setSidebar(null);
		} else {
			setSidebar(tab);
		}
	};

	const handleMouseEnter = ()=>{
		setVisible(true);
	}
	const handleMouseLeave = ()=>{
		if(!sidebar) setVisible(false)
	}

	useEffect(() => {
	  if(!sidebar) setVisible(false)
	}, [sidebar])
	

	return (
		<div className="absolute inset-0 left-0 font-sans">	
			{sidebar && <div onClick={() => setSidebar(null)} className="cursor-pointer absolute inset-0 bg-black opacity-50 z-10"></div> }
			<div className="flex h-full items-stretch p-1">
				<div 
					onMouseEnter={handleMouseEnter} 
					onMouseLeave={handleMouseLeave} 
					className="z-10 h-fit flex flex-col shadow-sm items-center justify-start bg-indigo-50 border border-solid rounded">
					
					<SidebarItem
						icon={
							<>
								<AlignJustify
									size={25}
									onClick={() => setVisible(true)}
									className={`z-20 cursor-pointer text-gray-500 transition-all duration-300 ${visible ? 'opacity-0 invisible h-0' : 'opacity-100 visible h-auto'}`}
								/>
								<CircleX
									size={25}
									onClick={() => setVisible(false)}
									className={`z-20 cursor-pointer text-gray-500 transition-all duration-300 ${!visible ? 'opacity-0 invisible h-0' : 'opacity-100 visible h-auto'}`}
								/>
							</>
						}
						active={false}
					/>
					<div className={`flex flex-col justify-between items-center gap-2 transition-all duration-300 ease-in-out origin-top transform ${visible ? 'translate-y-0 opacity-100 visible max-h-56' : '-translate-y-10 opacity-0 invisible max-h-0'}`}>
						<SidebarItem
							icon={
								<BookOpenCheck
									size={25}
									onClick={() =>
										handleSidebarClick(Tabs.TableOfContents)
									}
								/>
							}
							active={sidebar === Tabs.TableOfContents ? true : false}
							tooltip="Table Of Contents"
						/>
						<SidebarItem
							icon={
								<Bookmark
									size={25}
									onClick={() =>
										handleSidebarClick(Tabs.Bookmarks)
									}
								/>
							}
							active={sidebar === Tabs.Bookmarks ? true : false}
							tooltip="Bookmarks"
						/>
						<SidebarItem
							icon={
								<MessageSquare
									size={25}
									onClick={() =>
										handleSidebarClick(Tabs.Annotations)
									}
								/>
							}
							active={sidebar === Tabs.Annotations ? true : false}
							tooltip="Annotations"
						/>
						<SidebarItem
							icon={
								<Search
									size={25}
									onClick={() => handleSidebarClick(Tabs.Search)}
								/>
							}
							active={sidebar === Tabs.Search ? true : false}
							tooltip="Search"
						/>
						<SidebarItem
							icon={
								<Settings
									size={25}
									onClick={() =>
										handleSidebarClick(Tabs.Settings)
									}
								/>
							}
							active={sidebar === Tabs.Settings ? true : false}
							tooltip="Settings"
						/>
					</div>
				</div>
				{sidebar &&
					<div className="relative flex-grow flex z-20 px-1">
						<Drawer />
						<div
							className="flex-grow flex justify-end cursor-pointer"
							onClick={() => setSidebar(null)}
						>
							<CircleX
								size={40}
								onClick={() => setSidebar(null)}
								className="md:m-3 sm:m-1 text-gray-100 hover:text-gray-300 sm:hidden"
							/>
						</div>
					</div>
				}
			</div>


		</div>
	);
};
