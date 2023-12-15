import React, { useState } from "react";
import { colors } from "../../lib/hooks/useAnnotationState";
import { useAnnotation } from "@/Reader/lib/hooks/useReaderContext";
import { Tooltip } from "antd";
const ColorSelector = () => {
	const { color, setColor } = useAnnotation();

	return (
		<div className="flex space-x-2 my-2">
			{colors.map(([key, value]) => (
				<Tooltip key={key} title={key}>
					<div
						className={`h-6 w-6 rounded-full cursor-pointer ${
							color === value
								? "ring-2 ring-offset-2 ring-gray-400"
								: ""
						}`}
						style={{ backgroundColor: value }}
						onClick={() => setColor(value)}
					></div>
				</Tooltip>
			))}
		</div>
	);
};

export default ColorSelector;
