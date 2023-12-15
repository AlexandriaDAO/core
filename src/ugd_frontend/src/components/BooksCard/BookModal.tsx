import { Reader } from "@/Reader";
import { ReaderProvider } from "@/Reader/lib/providers/ReaderProvider";
import React from "react";

const BookModal = () => {
	return (
		<ReaderProvider>
			<div className="relative w-full p-2">
				<div className="max-w-7xl m-auto grid grid-cols-1 gap-4">
					{/* Modal View of Reader */}
					<Reader
						// showSidebar={false}
						// showToolbar={false}
						// external={onClickExternal}
					/>
				</div>
			</div>
		</ReaderProvider>
	);
};

export default BookModal;