import React from "react";
import { Book } from "../portalSlice";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/lib/components/dialog";
import { Info } from "lucide-react";

interface IBookInfoProps {
    book?: Book;
};

const BookInfo: React.FC<IBookInfoProps> = ({
    book
}: IBookInfoProps) => {
    if(!book) return <></>

    return (
        <div onClick={e=>e.stopPropagation()}>
            <Dialog>
                <DialogTrigger asChild>
                    <div className="absolute top-2 left-2 bg-transparent hover:bg-muted rounded-full">
                        <Info size={26} className="text-muted cursor-pointer hover:text-primary"/>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{book.title}</DialogTitle>
                        <DialogDescription>Author: {book.author_first + " " + book.author_last}</DialogDescription>
                    </DialogHeader>
                    <pre className="font-roboto-condensed font-normal text-sm overflow-auto bg-gray-600 text-white p-5">
                        <code>{JSON.stringify(book, null, 2)}</code>
                    </pre>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default BookInfo;