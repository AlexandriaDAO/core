import { Dispatch, SetStateAction, useState } from "react";

// Define the shape of the setting state
export interface ISettingState {
	showSetting: boolean;
	setShowSetting: Dispatch<SetStateAction<boolean>>;
}

export default function useSettingState(): ISettingState {
	const [showSetting, setShowSetting] = useState<boolean>(false);

	return {
		showSetting,
		setShowSetting,
	};
}
