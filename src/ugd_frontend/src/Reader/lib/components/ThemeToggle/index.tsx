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
					size={30}
					className="cursor-pointer p-0.5 text-indigo-800 hover:text-gray-500"
				/>
			) : (
				<MdDarkMode
					onClick={toggleTheme}
					size={30}
					className="cursor-pointer p-0.5 hover:text-indigo-800 text-gray-500"
				/>
			)}
		</>
	);
};

export default ThemeToggle;
