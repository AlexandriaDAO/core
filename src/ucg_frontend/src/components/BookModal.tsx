import { Reader } from "@/features/reader";
import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";
import React from "react";

type IBookModalProps = {
	bookUrl?: any;
};

const BookModal:React.FC<IBookModalProps> = ({
	bookUrl = "https://gateway.irys.xyz/bM5J42-tzUUvkaO5Ry_H9mSrXzKeiaj4cdo8devs2h4",
}: IBookModalProps) => {
	return (
		<ReaderProvider>
			<div className="relative w-full p-2">
				<div className="max-w-7xl m-auto grid grid-cols-1 gap-4">
					<Reader bookUrl={bookUrl} />
				</div>
			</div>
		</ReaderProvider>
	);
};

export default BookModal;