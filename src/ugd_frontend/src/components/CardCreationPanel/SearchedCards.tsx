
import { faBookmark, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import Resizer from 'react-image-file-resizer'

interface SharedCardsInterface {
    item: any
    isHideCta?: boolean
    SelectSourceCard?: (newItem?: any) => void,
}

const SearchedCards: React.FC<SharedCardsInterface> = ({ item, isHideCta, SelectSourceCard }) => {
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



    if (!item) {
        return null
    }


    return (
        <div className="searchedCardBx" key={item}>
            <div className="innerSaerchedCardBx">
                <div className="searchedCardimg">
                    <img src={compressedImageSrc} alt="" />
                </div>
                <div className="searchecCardText">
                    <div className="innerSearchedTextData">
                        <h2>{item.title}</h2>
                        <p>{item.content} ...</p>
                    </div>
                </div>
            </div>
            {!isHideCta && <div className="showSerachedCardsActionBtns">
                <label onClick={() => SelectSourceCard && SelectSourceCard(item)}><FontAwesomeIcon icon={faPlus} size='sm' /></label>
                <label><FontAwesomeIcon icon={faBookmark} size='sm' /></label>
            </div>}
        </div>
    )
}

export default SearchedCards
