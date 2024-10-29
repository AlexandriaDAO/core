import React, { ChangeEvent } from "react";
import { useReader } from "../hooks/useReaderContext";
import { Slider } from "antd";
import { Minus, Plus } from "lucide-react";

const FontSizeRange: React.FC = () => {
	const { userSettings, setUserSettings } = useReader();

	const onChangeComplete = (value: number) => {
		if (value > 40 || value < 10) return;
		setUserSettings({
			...userSettings,
			fontSize: value,
		});
	};

	function handleIncrementFontSize() {
		if (userSettings.fontSize >= 40) return;
		setUserSettings({
			...userSettings,
			fontSize: userSettings.fontSize + 1,
		});
	}

	function handleDecrementFontSize() {
		if (userSettings.fontSize <= 10) return;
		setUserSettings({
			...userSettings,
			fontSize: userSettings.fontSize - 1,
		});
	}

	return (
		<div className="flex flex-col items-stretch font-roboto-condensed font-medium text-black">
			<label className="text-lg" htmlFor="font-family">
				Font Size
			</label>

			<div className="flex justify-between items-center gap-2">
				<Minus
					onClick={userSettings.fontSize > 10 ? handleDecrementFontSize : undefined}
					size={22}
					className={`p-1 border border-solid border-black rounded-full duration-300 transition-all ${userSettings.fontSize <= 10 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-black hover:border-white hover:text-white'}`}
				/>
				<Slider
					className="flex-grow"
					min={10}
					max={40}
					value={userSettings.fontSize}
					onChange={onChangeComplete}
				/>
				<Plus
					onClick={userSettings.fontSize < 40 ? handleIncrementFontSize : undefined}
					size={22}
					className={`p-1 border border-solid border-black rounded-full duration-300 transition-all ${userSettings.fontSize >= 40 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-black hover:border-white hover:text-white'}`}
				/>
			</div>
		</div>
	);
};

export default FontSizeRange;
