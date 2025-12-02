import React from "react";
import { useReader } from "../hooks/useReaderContext";
import { Plus, Minus } from "lucide-react";

const FontSizeButton: React.FC = () => {
	const { userSettings, setUserSettings } = useReader();

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
		<div className="flex items-center justify-between gap-1">

			<Plus
				onClick={
					userSettings.fontSize < 40
						? handleIncrementFontSize
						: undefined
				}
				size={30}
				className={`p-1 text-white bg-transparent border border-solid border-white rounded-full duration-300 transition-all ${
					userSettings.fontSize >= 40
						? "opacity-50 cursor-not-allowed"
						: "cursor-pointer hover:bg-white hover:text-black hover:border-black "
				}`}
			/>
			<Minus
				onClick={
					userSettings.fontSize > 10
						? handleDecrementFontSize
						: undefined
				}
				size={30}
				className={`p-1 text-white bg-transparent border border-solid border-white rounded-full duration-300 transition-all ${
					userSettings.fontSize <= 10
						? "opacity-50 cursor-not-allowed"
						: "cursor-pointer hover:bg-white hover:text-black hover:border-black "
				}`}
			/>
		</div>
	);
};

export default FontSizeButton;
