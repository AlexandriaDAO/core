import { Reader } from "src/ucg_frontend/src/features/reader";
import { ReaderProvider } from "src/ucg_frontend/src/features/reader/lib/providers/ReaderProvider";
import React from "react";

type IBookModalProps = {
	bookUrl?: any;
};

const BookModal:React.FC<IBookModalProps> = ({
	bookUrl = "test.epub",
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