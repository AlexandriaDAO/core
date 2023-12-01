import React from "react";
import { Reader } from "../Reader";
import { ReaderProvider } from "../Reader/lib/providers/ReaderProvider";

const EReader = () => {
	return(
		<ReaderProvider>
			<div className="relative h-full w-full min-h-screen p-4">
				<div className="max-w-6xl mx-auto grid grid-cols-1 gap-4">
					<Reader />
				</div>
			</div>
		</ReaderProvider>	
	)
}

export default EReader;
