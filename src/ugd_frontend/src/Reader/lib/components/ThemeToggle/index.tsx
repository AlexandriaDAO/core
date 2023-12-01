import React from "react";
import {
	ThemeToggleStyle as defaultThemeToggleStyles,
	type IThemeToggleStyle,
} from "./style";
import { useReader } from "../../hooks/useReaderContext";

import { MdDarkMode } from "react-icons/md";
import { MdOutlineDarkMode } from "react-icons/md";

interface ThemeToggleProps {
	themeToggleStyles?: IThemeToggleStyle;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
	themeToggleStyles = defaultThemeToggleStyles,
}) => {
	const {
		userSettings: { theme, fontSize },
		setUserSettings,
	} = useReader();

	// rendition.current?.flow("scrolled");
	// 	rendition.current?.requireManager("continuos");
	function toggleTheme() {
		if (theme === "dark") {
			setUserSettings({
				fontSize,
				theme: "light",
			});
		} else {
			setUserSettings({
				fontSize,
				theme: "dark",
			});
		}
	}

	return (
		<>
			{theme === "dark" ? (
				<MdOutlineDarkMode
					onClick={toggleTheme}
					size={35}
					className="cursor-pointer p-1 text-indigo-800"
				/>
			) : (
				<MdDarkMode
					onClick={toggleTheme}
					size={35}
					className="cursor-pointer p-1  hover:bg-indigo-50 text-gray-600"
				/>
			)}
		</>
	);
};

export default ThemeToggle;
