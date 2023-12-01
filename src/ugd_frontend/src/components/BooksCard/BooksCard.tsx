import React, { useState } from 'react'
import './bookscard.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faExternalLink } from '@fortawesome/free-solid-svg-icons'
import Resizer from 'react-image-file-resizer'
import BookModal from './BookModal'
import { Modal } from 'antd'


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
    const [isBookModalVisible, setIsBookModalVisible] = useState(false);

    // Function to show the modal
    const showBookModal = () => {
        setIsBookModalVisible(true);
    };

    // Function to handle when the user clicks OK in the modal
    const handleOk = () => {
        setIsBookModalVisible(false);
    };

    // Function to handle when the user clicks Cancel in the modal
    const handleCancel = () => {
        setIsBookModalVisible(false);
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
                        {/* <button onClick={onReadBookClick}>Read More <label><FontAwesomeIcon icon={faExternalLink} color='gray' size='sm' /></label></button> */}
                        <button onClick={showBookModal}>Read More <label><FontAwesomeIcon icon={faExternalLink} color='gray' size='sm' /></label></button>
                        {/* <Modal
                            trigger={<button>Read More <label><FontAwesomeIcon icon={faExternalLink} color='gray' size='sm' /></label></button>}
                            header='Reminder!'
                            content='Call Benjamin regarding the reports.'
                            actions={['Snooze', { key: 'done', content: 'Done', positive: true }]}
                        /> */}
                         <Modal
                            centered
                            open={isBookModalVisible}
                            onCancel={handleCancel}
                            footer={null}
                            closable={false}
                            
                            width={'70rem'}
                            // width={'md:aspect-video aspect-[3/4] w-full h-full'}
                            classNames={{ content: '!p-0', }}
                        >
                            <BookModal />
                        </Modal>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BooksCard
