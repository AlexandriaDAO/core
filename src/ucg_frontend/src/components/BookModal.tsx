// import { Reader } from "@/features/reader";
// import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";
// import React from "react";

// type IBookModalProps = {
// 	bookUrl?: any;
// };

// const BookModal:React.FC<IBookModalProps> = ({
// 	// bookUrl = "https://gateway.irys.xyz/bM5J42-tzUUvkaO5Ry_H9mSrXzKeiaj4cdo8devs2h4",
// 	bookUrl = "https://node1.irys.xyz/bHGOLFr4KfXkrRESdD3bJAb3T5a8eROkVZG8G45i74k",
// }: IBookModalProps) => {
// 	return (
// 		<ReaderProvider>
// 			<div className="relative w-full p-2">
// 				<div className="max-w-7xl m-auto grid grid-cols-1 gap-4">
// 					<Reader bookUrl={bookUrl} />
// 				</div>
// 			</div>
// 		</ReaderProvider>
// 	);
// };

// export default BookModal;





import { Reader } from "@/features/reader";
import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";
import React from "react";
import { useBook } from "@/contexts/BookContext";

// Import the Book interface or define it here if it's not in a separate file
interface Book {
    key: number;
    title: string;
    author: string;
    image: string;
    transactionId: string;
}

type IBookModalProps = {
    book: Book;
};

const BookModal = () => {
		const { selectedBook } = useBook();

		if (!selectedBook) return null;

		const bookUrl = `https://node1.irys.xyz/${selectedBook.transactionId}`;

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