import React, { useState } from 'react'
import './bookscard.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown, faAngleUp, faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import Resizer from 'react-image-file-resizer'
import { useAuthors } from '@/contexts/AuthorContext'


interface CardProps {
    image: string;
    title: string;
    description: string;
    flipped: boolean;
    onCardClick: () => void;
    onReadBookClick: (event: React.MouseEvent) => void;
}


const BooksCard: React.FC<CardProps> = ({ image, title, description, flipped, onCardClick, onReadBookClick }) => {
    const [compressedImageSrc, setCompressedImageSrc] = useState<string>("");
    const { book, setBook } = useAuthors();

    // Function to show the modal
    const showBookModal = () => {
        if(book) setBook(null)
        else setBook(title);
    };

    if (image) {
        fetch(image)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network Response was not okay');
                }
                return response.blob();
            })
            .then(blob => {
                Resizer.imageFileResizer(
                    blob,
                    300,
                    300,
                    'PNG',
                    90,
                    0,
                    (uri) => {
                        if (typeof uri === 'string') {
                            setCompressedImageSrc(uri);
                        }
                    },
                    'base64'
                );
            })
            .catch(error => {
                console.error('There was a problem fetching the image: ', error);
                console.log('Failed image URL:', image);
            });
    }

    return (
        <div className={flipped ? 'mainBooksCardContainer flipped' : 'mainBooksCardContainer'}>
            <div className="innerBooksCardContainer">
                <div className="FrontBooksCard flip-front">
                    <div className="BooksCardImg">
                        <img src={compressedImageSrc} alt="" />
                    </div>
                    <div className="BooksCardDetails">
                        <h2>{title}</h2>
                        <button onClick={onCardClick}>View Details</button>
                    </div>
                </div>
                <div className="BackBooksCard flip-back">
                    <div className="BooksCardDescription">
                        <p>{description}</p>
                    </div>
                    <div className="BooksCardCta">
                        <button onClick={onCardClick}><FontAwesomeIcon icon={faChevronLeft} color='gray' size='sm' /></button>
                        <button onClick={showBookModal} className='cursor-pointer'>Read More <label><FontAwesomeIcon icon={book ? faAngleUp : faAngleDown} color='gray' size='sm' /></label></button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BooksCard
