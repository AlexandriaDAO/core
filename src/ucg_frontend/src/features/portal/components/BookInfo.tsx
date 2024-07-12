import React, { useState } from "react";
import { Tooltip, Modal } from "antd";
import { Book } from "../portalSlice";

interface IBookInfoProps {
    book?: Book;
};

const BookInfo: React.FC<IBookInfoProps> = ({
    book
}: IBookInfoProps) => {
    const [showModal, setShowModal] = useState(false);

    const handleInfoClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowModal(true);
    };

    if(!book) return <></>

    return (
        <>
            <Tooltip title="Click for more info">
                <button
                    className="absolute top-2 right-2 bg-white text-black rounded-full w-6 h-6 flex items-center justify-center"
                    onClick={(e) => handleInfoClick(e)}
                >
                    i
                </button>
            </Tooltip>
            <Modal
                title="Book Information"
                open={showModal}
                onCancel={() => setShowModal(false)}
                footer={null}
            >
                <div>
                    <h2>{book.title}</h2>
                    <p>Author: {book.author}</p>
                    {book.tags.map((tag) => (
                        <p key={tag.name}>
                            {tag.name}: {tag.value}
                        </p>
                    ))}
                </div>
            </Modal>

        </>
    );
}

export default BookInfo;