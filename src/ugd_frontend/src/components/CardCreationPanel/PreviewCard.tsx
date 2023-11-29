import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import SearchedCards from './SearchedCards'


interface PreviewCardInterface {
    selectedSourceCards: any[]
}

const PreviewCard: React.FC<PreviewCardInterface> = ({ selectedSourceCards }) => {

    const [isOpened, setIsOpened] = useState<boolean>(true)

    return (
        <div className='mainPreviewCardsContainer'>
            <div className="innerPreviewContainer">
                <div className="previewContainerHeader">
                    <h2>Preview Card</h2>

                    <button onClick={() => setIsOpened(!isOpened)}><FontAwesomeIcon icon={isOpened ? faChevronUp : faChevronDown} size='sm' /></button>
                </div>
                <div className={!isOpened ? "innerPreviewCardsContainerBx hide" : "innerPreviewCardsContainerBx"}>

                    <div className="PreviewCardsContainerBx">
                        <div className="previewCardBx">
                            {
                                selectedSourceCards?.map((item) => {
                                    return (
                                        <SearchedCards item={item} isHideCta={true} />
                                    )
                                })
                            }

                        </div>
                        <div className="previewCardCta">

                            <button>Sumarize</button>
                            <button>Ai Output</button>
                            <button>Rating</button>
                            <button>Optimze Results</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PreviewCard
