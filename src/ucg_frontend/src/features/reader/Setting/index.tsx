// src/Setting/index.tsx
import React, { useEffect, useRef, useState } from "react";
import { useSetting } from "../lib/hooks/useReaderContext";
import ThemeSelect from "../lib/components/ThemeSelect";
import FontFamilySelect from "../lib/components/FontFamilySelect";
import FontSizeRange from "../lib/components/FontSizeRange";
import FlowToggle from "../lib/components/FlowToggle";

export const Setting: React.FC = () => {
	const { showSetting, setShowSetting } = useSetting();

	return (
		<div className="absolute inset-0 left-0 font-sans">
			{showSetting && (
				<div
					onClick={() => setShowSetting(false)}
					className="cursor-pointer absolute inset-0 bg-black opacity-50 z-10"
				></div>
			)}
			<div
				className={`absolute top-0 left-0 w-[500px] flex flex-col gap-2 p-2 h-full bg-indigo-50 shadow-lg transform transition-transform duration-300 ease-in-out z-20 ${
					showSetting ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<p className="text-center mb-2 font-roboto-condensed font-medium text-black">Reader Settings</p>
				<ThemeSelect />
				<FontFamilySelect />
				<FontSizeRange />
				<FlowToggle />
			</div>
		</div>
	);
};
