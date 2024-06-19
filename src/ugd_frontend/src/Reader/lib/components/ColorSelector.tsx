import React, { useState } from "react";
import { Tooltip } from "antd";
import { colors } from "../hooks/useAnnotationState";
import { useAnnotation } from "../hooks/useReaderContext";
const ColorSelector = () => {
	const { color, setColor } = useAnnotation();

	return (
		<div className="flex space-x-1">
			{colors.map(([key, value]) => (
				<Tooltip key={key} title={key}>
					<div
						className={`h-4 w-4 rounded-full cursor-pointer ${
							color === value
								? "ring-1 ring-offset-1 ring-gray-400"
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
