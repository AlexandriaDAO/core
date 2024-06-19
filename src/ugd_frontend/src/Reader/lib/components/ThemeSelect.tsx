import React, { ChangeEvent } from "react";
import { useReader } from "../hooks/useReaderContext";

const ThemeSelect: React.FC = () => {
	const {
		userSettings,
		setUserSettings,
	} = useReader();

	// rendition.current?.flow("scrolled");
	// 	rendition.current?.requireManager("continuos");

	function handleThemeChange(event: ChangeEvent<HTMLSelectElement>): void {
		setUserSettings({
			...userSettings,
			theme: event.target.value,
		});
	}

	return (
		<div className="flex flex-col items-start font-roboto-condensed font-medium text-black">
			<label className="text-lg" htmlFor="theme">
				Theme
			</label>

			<select
			defaultValue={userSettings.theme}
			onChange={handleThemeChange}
			id="theme"
			className="w-full border border-gray-400 focus:border-gray-700 p-1 rounded text-xl">
				<option value="dark" selected={userSettings.theme==='dark'}>Dark</option>
				<option value="light" selected={userSettings.theme==='light'}>Light</option>
			</select>
		</div>
	);
};

export default ThemeSelect;
