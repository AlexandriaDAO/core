import React, { useState } from 'react'
import './cardCreationpanel.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import useAuthorBooks from '@/utils/useAuthorBooks'
import SearchedCards from './SearchedCards'
import PreviewCard from './PreviewCard'
import SelecetedCard from './SelecetedCard'

interface CardCreationPanelInterface {
    currentAuthorId: any
}

const CardCreationPanel: React.FC<CardCreationPanelInterface> = ({ currentAuthorId }) => {
    const [selectedSourceCards, setSelectedSourceCards] = useState<any[]>([])
    const books = useAuthorBooks(currentAuthorId);



    const SelectSourceCard = (newItem?: any) => {
        let isSourceCardSelected = selectedSourceCards.find((item) => item?.title === newItem.title)
        !isSourceCardSelected && setSelectedSourceCards((prev) => ([...prev, newItem]))
    }

    const RemoveSourceCard = (newItem?: any) => {
        let filteredCards = selectedSourceCards.filter((item) => item.title !== newItem.title)
        setSelectedSourceCards(filteredCards)
    }

    return (
        <>
            {selectedSourceCards?.length ? <PreviewCard selectedSourceCards={selectedSourceCards} /> : null}
            <div className='mainCardCreationPanel_Container'>
                <div className="innerCardCreationPanel">
                    <div className="cardCreationPanelHeader">
                        <div className="innerHeaderContainer">
                            <h2>Create Your Own Card</h2>
                            <div className="innerHeaderctaBtns">
                                <button>Save Private</button>
                                <button>Publish</button>
                            </div>
                        </div>
                    </div>


                    <div className="cardCreationPanel_InnerContainer">
                        <div className="cardCreation_selectedCards">
                            <div className="header_selected_cards">
                                <h2>Selecetd Cards</h2>

                            </div>
                            <div className="inner_body_selecetd_cards">
                                {selectedSourceCards.map((item) => {
                                    return (
                                        <SelecetedCard item={item} RemoveSourceCard={RemoveSourceCard} />
                                    )
                                })}
                            </div>
                        </div>
                        <div className="cardCreation_searchedCards">

                            <div className="header_searched_cards">
                                <h2>Searched Results</h2>
                            </div>

                            <div className="innerSearchedCardsContainer">
                                {books.slice(0, 8).map((item, idx) => {
                                    return (
                                        <SearchedCards item={item} key={idx} SelectSourceCard={SelectSourceCard} />
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CardCreationPanel
