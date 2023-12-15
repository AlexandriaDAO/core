
import MessageContext from '@/contexts/MessageContext'
import GetOneBook from '@/utils/GetOneBook'
import { faBookmark, faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useContext, useEffect, useState } from 'react'
import Resizer from 'react-image-file-resizer'
import { ugd_backend } from '../../declarations/ugd_backend';
import { BookMarkedSourceCardContext } from '@/utils/BookMarkedSourceCardProvider'

interface SharedCardsInterface {
    item: any
    isHideCta?: boolean
    SelectSourceCard?: (newItem?: any) => void,
}

const SearchedCards: React.FC<SharedCardsInterface> = ({ item, isHideCta, SelectSourceCard }) => {
    const BookMarkedContext = useContext(BookMarkedSourceCardContext)
    const [isLoading, setIsLoading] = useState(false)
    const [compressedImageSrc, setCompressedImageSrc] = useState<string>("");
    const singleBook = GetOneBook(item.author.replace('_', ' '), item.title)
    const [cardData, setCardData] = useState(item)

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



    if (!item) {
        return null
    }



    // HANDLE BOOKMARK SOURCE CARD -----------------------------------------------

    async function bookmarkSourceCard(id: number) {
        setIsLoading(true)
        try {
            const post_id = BigInt(id);
            await ugd_backend.bookmark_sc(post_id)
            // UPDATE THE STATUS IN (LOCAL | CURRENT) STATE --------------------------------
            setCardData({ ...item, bookmarked: true })
            // UPDATE ITEM IN BOOKMARKED ARRAY
            BookMarkedContext?.UpdateBookmarkedSourceCards({ ...cardData, bookmarked: true })
            alert("Bookmarked Successfully")
            setIsLoading(false)
        } catch (error) {
            alert("There was an error while bookmarking source card")
            console.log(`Error while bookmarking ${id} : ${error}`)
            setIsLoading(false)
        }
    }



    return (
        <div className="searchedCardBx" key={cardData.post_id}>
            <div className="innerSaerchedCardBx">
                <div className="searchedCardimg">
                    <img src={compressedImageSrc} alt="" />
                </div>
                <div className="searchecCardText">
                    <div className="innerSearchedTextData">
                        <h2>{cardData.title}</h2>
                        <p>{cardData.content} ...</p>
                    </div>
                </div>
            </div>
            {!isHideCta && <div className="showSerachedCardsActionBtns">
                <label onClick={() => SelectSourceCard && SelectSourceCard(cardData)}><FontAwesomeIcon icon={faPlus} size='sm' /></label>
                <label onClick={() => !isLoading && !cardData.bookmarked && bookmarkSourceCard(cardData?.post_id)} className={cardData.bookmarked ? 'active' : ''}><FontAwesomeIcon icon={isLoading ? faSpinner : faBookmark} spin={isLoading} size='sm' /></label>
            </div>}
        </div>
    )
}

export default SearchedCards
