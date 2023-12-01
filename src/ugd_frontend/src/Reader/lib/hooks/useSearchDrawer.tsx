import { useState } from "react";

const useSearchDrawer = (isVisible: boolean = false) => {
	const [isSearchDrawer, setSearchDrawer] = useState(isVisible);
	const toggleSearchDrawer = () => {
		setSearchDrawer(!isSearchDrawer);
	};

	return {
		isSearchDrawer,
		setSearchDrawer,
		toggleSearchDrawer,
	};
};

export default useSearchDrawer;
