import { Reader } from "@/features/reader";
import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import React from "react";

const BookModal: React.FC = () => {

    const { selectedSearchedBook } = useAppSelector(state => state.home);

    if(!selectedSearchedBook || !selectedSearchedBook.manifest ) return <></>

    const bookUrl = `https://gateway.irys.xyz/${selectedSearchedBook.manifest}/book`;

	return (
        <div className="w-full pb-5 text-black scale-y-100 transition-all duration-500 flex flex-col justify-between">
            <ReaderProvider>
                <div className="relative w-full p-2">
                    <div className="max-w-7xl m-auto grid grid-cols-1 gap-4">
                        <Reader bookUrl={bookUrl} cfi={selectedSearchedBook.cfi} />
                    </div>
                </div>
            </ReaderProvider>
        </div>
	);
}

export default BookModal;
