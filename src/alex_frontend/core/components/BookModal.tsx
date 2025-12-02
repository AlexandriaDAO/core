import { Book } from "@/features/portal/portalSlice";
import { Reader } from "@/features/reader";
import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React, { useEffect } from "react";

interface IBookModalProps {
	book: Book;
}

const BookModal: React.FC<IBookModalProps> = ({
    book
}: IBookModalProps) => {
    // if(!book) return;

	return (
        <div className="w-full pb-5 text-black scale-y-100 transition-all duration-500 flex flex-col justify-between">
            <ReaderProvider>
                <div className="relative w-full p-2">
                    <div className="max-w-7xl m-auto grid grid-cols-1 gap-4">
                        <Reader bookUrl={`https://gateway.irys.xyz/${book.manifest}/book`} />
                    </div>
                </div>
            </ReaderProvider>
        </div>
	);
}

export default BookModal;
