import React from "react";
import { useReader } from "../../lib/hooks/useReaderContext";

export const Setting: React.FC = () => {
	const { userSettings, setUserSettings } = useReader();

	const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setUserSettings({
			fontSize: e.target.value + "%",
			theme: userSettings.theme,
		});
	};

	return (
		<div className="h-full overflow-hidden flex flex-col">
			<p className="font-semibold text-lg text-center py-2">Settings</p>
			<div className="p-3 flex flex-col justify-center items-start">
				<label
					htmlFor="font"
					className="text-gray-600 font-medium text-md"
				>
					Font Size
				</label>
				<input
					type="number"
					min={1}
					className="border-2 border-gray-300 focus:border-gray-500 outline-none w-full p-1 rounded-md"
					value={userSettings.fontSize.split("%")[0]}
					onChange={handleFontSizeChange}
				/>
			</div>
		</div>
	);
};
