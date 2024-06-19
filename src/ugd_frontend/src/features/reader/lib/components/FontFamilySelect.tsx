import React, { ChangeEvent } from "react";
import { useReader } from "../hooks/useReaderContext";

const FontFamilySelect: React.FC = () => {
	const {
		userSettings,
		setUserSettings,
	} = useReader();

	// rendition.current?.flow("scrolled");
	// 	rendition.current?.requireManager("continuos");

	function handleFontFamilyChange(event: ChangeEvent<HTMLSelectElement>): void {
		setUserSettings({
			...userSettings,
			fontFamily: event.target.value,
		});
	}

	return (
		<div className="flex flex-col items-start font-roboto-condensed font-medium text-black">
			<label className="text-lg" htmlFor="font-family">
				Font Family
			</label>

			<select
			defaultValue={userSettings.fontFamily}
			onChange={handleFontFamilyChange}
			id="font-family"
			className="w-full border border-gray-400 focus:border-gray-700 p-1 rounded text-xl">
				<option value="auto" selected={userSettings.theme==='auto'}>Auto</option>
				<option value="Roboto Condensed" selected={userSettings.theme==='Roboto Condensed'}>Roboto Condensed</option>
				<option value="Syne" selected={userSettings.theme==='Syne'}>Syne</option>
				<option value="serif" selected={userSettings.theme==='serif'}>Serif</option>
				<option value="sans-serif" selected={userSettings.theme==='sans-serif'}>Sans Serif</option>
				<option value="monospace" selected={userSettings.theme==='monospace'}>Monospace</option>
				<option value="system-ui" selected={userSettings.theme==='system-ui'}>System Ui</option>
			</select>
		</div>
	);
};

export default FontFamilySelect;
