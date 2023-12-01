import React from "react";
import {
	ScrollToggleStyle as defaultScrollToggleStyles,
	type IScrollToggleStyle,
} from "./style";
import { useReader } from "../../hooks/useReaderContext";

import { CgScrollH } from "react-icons/cg";
import { CgScrollV } from "react-icons/cg";

interface ScrollToggleProps {
	scrollToggleStyles?: IScrollToggleStyle;
}

const ScrollToggle: React.FC<ScrollToggleProps> = ({
	scrollToggleStyles = defaultScrollToggleStyles,
}) => {
	const { scroll, setScroll, rendition } = useReader();

	function toggleTheme() {
		if (!rendition.current) return;

		if (scroll === "paginated") {
			rendition.current?.flow("scrolled");
			setScroll("scrolled");
		} else {
			rendition.current?.flow("paginated");
			setScroll("paginated");
		}
	}

	return (
		<>
			{scroll === "paginated" ? (
				<CgScrollV
					onClick={toggleTheme}
					size={35}
					className="cursor-pointer p-1  hover:bg-indigo-50 text-gray-600"
				/>
			) : (
				<CgScrollH
					onClick={toggleTheme}
					size={35}
					className="cursor-pointer p-1 text-indigo-800"
				/>
			)}
		</>
	);
};

export default ScrollToggle;
