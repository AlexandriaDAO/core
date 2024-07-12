import { Reader } from "@/features/reader";
import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React from "react";

const BookModal: React.FC = () => {

    const { selectedBook } = useAppSelector(state => state.portal);
    var bookUrl = 'test.epub';

    if(selectedBook && selectedBook.transactionId){
        bookUrl = `https://node1.irys.xyz/${selectedBook.transactionId}`
    }

    console.log('bookurl', bookUrl);

	return (
        <div className="w-full pb-5 text-black scale-y-100 transition-all duration-500 flex flex-col justify-between">
            <ReaderProvider>
                <div className="relative w-full p-2">
                    <div className="max-w-7xl m-auto grid grid-cols-1 gap-4">
                        <Reader bookUrl={bookUrl} />
                    </div>
                </div>
            </ReaderProvider>
        </div>
	);
}

export default BookModal;
