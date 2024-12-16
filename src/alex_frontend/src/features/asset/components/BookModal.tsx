// another BookModal is available in @/components,
// that one is being used but should eventually be replaced with this one

import React from "react";
import { Book } from "@/features/asset/types";
import { Reader } from "@/features/reader";
import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";

interface IBookModalProps {
	book: Book;
}

const BookModal: React.FC<IBookModalProps> = ({
    book
}: IBookModalProps) => {
	return (
        <div className="w-full text-black scale-y-100 transition-all duration-500 flex flex-col justify-between">
            <ReaderProvider>
                <div className="relative w-full border border-ring rounded">
                    <div className="max-w-7xl m-auto grid grid-cols-1 gap-4">
                        <Reader bookUrl={`https://gateway.irys.xyz/${book.manifest}/asset`} />
                    </div>
                </div>
            </ReaderProvider>
        </div>
	);
}

export default BookModal;
