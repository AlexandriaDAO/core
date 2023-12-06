import { useState, useEffect } from "react";
import { useAuthors } from "../contexts/AuthorContext";
import { Book } from "../cards/MessageCard/types";
import { sanitizeTitleForPath } from "./handleReadBookClick";

const GetOneBook = (authorId: string, bookName: string) => {
    const [books, setBooks] = useState<Book[]>([]);
    const { authors } = useAuthors();

    useEffect(() => {
        const authorInfo = authors.find((info) => info.id === authorId);
        const booksForAuthor: Book[] = [];

        authorInfo?.books?.forEach((title, index) => {
            bookName?.includes(title) && booksForAuthor.push({
                author: authorId,
                description:
                    authorInfo.book_descriptions?.[index] || "Description not available",
                categories: authorInfo.category || [],
                imagePath: `/images/books/${authorId}/${sanitizeTitleForPath(
                    title
                )}.png`,
                title: title,
            });
        });

        setBooks(booksForAuthor);
    }, [authorId, authors]);

    return books[0];
};

export default GetOneBook;
