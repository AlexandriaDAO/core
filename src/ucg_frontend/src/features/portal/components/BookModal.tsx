import { Reader } from "@/features/reader";
import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React from "react";

const BookModal: React.FC = () => {

    const { selectedBook } = useAppSelector(state => state.portal);

	return (
        <div className="w-full pb-5 text-black scale-y-100 transition-all duration-500 flex flex-col justify-between">
            <ReaderProvider>
                <div className="relative w-full p-2">
                    <div className="max-w-7xl m-auto grid grid-cols-1 gap-4">
                        <Reader bookUrl={
                            (selectedBook && selectedBook.transactionId) ? `https://node1.irys.xyz/${selectedBook.transactionId}`: 'test.epub'
                        } />
                    </div>
                </div>
            </ReaderProvider>
        </div>
	);
}

export default BookModal;
