import React from "react";
import { Book } from "../portalSlice";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/lib/components/dialog";
import { Info } from "lucide-react";
import { Button } from "@/lib/components/button";

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
                    <Button variant="outline" scale="icon" rounded="full" className="absolute top-2 left-2 p-0">
                        <Info size={26} />
                    </Button>
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