import { Dispatch, SetStateAction, useState } from "react";

export enum Tabs {
	TableOfContents = "toc",
	Bookmarks = "bookmark",
	Annotations = "annotation",
	Search = "search",
	Settings = "setting",
}

// Define the shape of the sidebar state
export interface ISidebarState {
	sidebar: Tabs | null;
	setSidebar: Dispatch<SetStateAction<Tabs | null>>;
}

export default function useSidebarState(): ISidebarState {
	const [sidebar, setSidebar] = useState<Tabs | null>(null);

	return {
		sidebar,
		setSidebar,
	};
}
