import React from "react";

import { useReader } from "../hooks/useReaderContext";
import { BookOpen, FileText } from "lucide-react";

const SpreadToggle: React.FC = () => {
	const { spread, setSpread, rendition, flow } = useReader();

	function toggleSpread() {
		if (!rendition.current) return;

		if (spread === "auto") {
			rendition.current.spread("none");
			setSpread("none");
		} else {
			rendition.current.spread("auto");
			setSpread("auto");
		}
	}

	return (
		<div className="flex items-center justify-center gap-1">
			<BookOpen
				onClick={toggleSpread}
				size={30}
				color={spread === "auto" && flow !== "scrolled" ? "#F6F930" : "#8E8E8E"}
				className={`border border-solid ${flow === "scrolled" ? 'border-gray-400' : `border-[${spread === "auto" ? "#F6F930" : "#8E8E8E"}]`} p-1 rounded-md ${flow === "scrolled" ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
			/>
			<FileText
				onClick={toggleSpread}
				size={30}
				color={spread === "none" && flow !== "scrolled" ? "#F6F930" : "#8E8E8E"}
				className={`border border-solid ${flow === "scrolled" ? 'border-gray-400' : `border-[${spread === "none" ? "#F6F930" : "#8E8E8E"}]`} p-1 rounded-md ${flow === "scrolled" ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
			/>
		</div>
	);
};

export default SpreadToggle;
