import React, { useEffect, useState } from "react";
import { Reader } from "@/features/reader";
import { ReaderProvider } from "@/features/reader/lib/providers/ReaderProvider";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { resetBookState } from '@/features/home/homeSlice';

const BookModal = () => {
    const { selectedBook, bookUrl } = useSelector((state: RootState) => state.home);
    const dispatch = useDispatch();
    const [key, setKey] = useState(Date.now());

    useEffect(() => {
        if (selectedBook && bookUrl) {
            setKey(Date.now());
        }
    }, [selectedBook, bookUrl]);

    if (!selectedBook || !bookUrl) return null;

    return (
        <ReaderProvider key={selectedBook?.transactionId}>
            <div className="relative w-full p-2">
                <div className="max-w-7xl m-auto grid grid-cols-1 gap-4">
                    <Reader key={key} bookUrl={bookUrl} />
                </div>
            </div>
        </ReaderProvider>
    );
};

export default BookModal;