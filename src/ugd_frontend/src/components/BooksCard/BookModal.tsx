import { Reader } from "@/Reader";
import { ReaderProvider } from "@/Reader/lib/providers/ReaderProvider";
import React from "react";
import { useNavigate } from "react-router-dom";

const BookModal = () => {
    const navigate = useNavigate();

	const onClickExternal = () => {
        navigate("/ereader");		
	};
	return (
		<ReaderProvider>
			<div className="relative h-full w-fullbg-stone-100">
				<div className="max-w-6xl mx-auto grid grid-cols-1 gap-4">
					{/* Modal View of Reader */}
					<Reader
						showSidebar={false}
						showToolbar={false}
						external={onClickExternal}
					/>
				</div>
			</div>
		</ReaderProvider>
	);
};

export default BookModal;
