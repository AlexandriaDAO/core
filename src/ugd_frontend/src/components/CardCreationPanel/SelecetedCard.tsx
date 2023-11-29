import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import Resizer from 'react-image-file-resizer'


interface SelectedCards {
    item: any,
    RemoveSourceCard: (newItem: any) => void
}

const SelecetedCard: React.FC<SelectedCards> = ({ item, RemoveSourceCard }) => {

    const [compressedImageSrc, setCompressedImageSrc] = useState<string>("");


    if (item.imagePath) {
        fetch(item.imagePath)
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
                console.log('Failed image URL:', item.imagePath);
            });
    }



    return (
        <div className="selectedCardBx" key={item.title}>
            <div className="selectedCardImg">
                <img src={compressedImageSrc} alt="" />
            </div>
            <div className="selectedCardBody">
                <div className="selectedBodyCardText">
                    <h2>{item.title}</h2>
                    <p>{item.description}</p>
                </div>
                <div className="selectedBodyCardBtns">
                    <label onClick={() => RemoveSourceCard(item)}> <FontAwesomeIcon icon={faXmark} size='1x' /> </label>
                </div>
            </div>
        </div>
    )
}

export default SelecetedCard
