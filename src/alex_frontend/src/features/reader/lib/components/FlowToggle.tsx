import React, { ChangeEvent } from "react";
import { useReader } from "../hooks/useReaderContext";

const FlowToggle: React.FC = () => {
	const { rendition, flow, setFlow } = useReader();

	function handleThemeChange(event: ChangeEvent<HTMLSelectElement>): void {
		if (!rendition.current) return;
		rendition.current.flow(event.target.value);
		setFlow(event.target.value);
	}

	return (
		<div className="flex flex-col items-start font-roboto-condensed font-medium text-black">
			<label className="text-lg" htmlFor="theme">
				Flow
			</label>

			<select
				defaultValue={flow}
				onChange={handleThemeChange}
				id="theme"
				className="w-full border border-gray-400 focus:border-gray-700 p-1 rounded text-xl"
			>
				<option value="paginated" selected={flow === "paginated"}>
					Paginated
				</option>
				<option value="scrolled" selected={flow === "scrolled"}>
					Scrolled
				</option>
			</select>
		</div>
	);
};

export default FlowToggle;
