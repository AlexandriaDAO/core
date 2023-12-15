import GetOneBook from '@/utils/GetOneBook'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useState } from 'react'
import Resizer from 'react-image-file-resizer'


interface SelectedCards {
    item: any,
    RemoveSourceCard: (newItem: any) => void
}

const SelecetedCard: React.FC<SelectedCards> = ({ item, RemoveSourceCard }) => {
    const [compressedImageSrc, setCompressedImageSrc] = useState<string>("");
    const singleBook = GetOneBook(item.author.replace('_', ' '), item.title)

    useEffect(() => {
        if (singleBook?.imagePath) {
            fetch(singleBook.imagePath)
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
                    console.log('Failed image URL:', singleBook?.imagePath);
                });
        }
    }, [singleBook?.imagePath])


    return (
        <div className="selectedCardBx" key={item.title}>
            <div className="selectedCardImg">
                <img src={compressedImageSrc} alt="" />
            </div>
            <div className="selectedCardBody">
                <div className="selectedBodyCardText">
                    <h2>{item.title}</h2>
                    <p>{item.content}</p>
                </div>
                <div className="selectedBodyCardBtns">
                    <label onClick={() => RemoveSourceCard(item)}> <FontAwesomeIcon icon={faXmark} size='1x' /> </label>
                </div>
            </div>
        </div>
    )
}

export default SelecetedCard
