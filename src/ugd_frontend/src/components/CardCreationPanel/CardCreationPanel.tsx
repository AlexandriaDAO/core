import React, { useState, useContext } from 'react'
import './cardCreationpanel.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import SearchedCards from './SearchedCards'
import PreviewCard from './PreviewCard'
import SelectedCard from './SelectedCard'
import MessageContext from '@/contexts/MessageContext'
import SkeltonLoading from './SkeltonLoading'
import SourceCardsPanel from '@/the-greats/SourceCardsPanel'

interface CardCreationPanelInterface {
    currentAuthorId: any
}

const CardCreationPanel: React.FC<CardCreationPanelInterface> = ({ currentAuthorId }) => {
    const [selectedSourceCards, setSelectedSourceCards] = useState<any[]>([])
    const messageContext = useContext(MessageContext);
    const [isOpened, setIsOpened] = useState(true)

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
            {selectedSourceCards?.length ? <PreviewCard selectedSourceCards={selectedSourceCards} setSelectedSourceCards={setSelectedSourceCards} /> : null}
            <div className='mainCardCreationPanel_Container'>
                <div className="innerCardCreationPanel">
                    <div className="cardCreationPanelHeader">
                        <div className="innerHeaderContainer">
                            <h2>Create Your Own Card</h2>
                            <div className="innerHeaderctaBtns">
                                <button className='dropDown_btn' onClick={() => setIsOpened(!isOpened)}><FontAwesomeIcon icon={isOpened ? faChevronUp : faChevronDown} size='sm' /></button>
                            </div>
                        </div>
                    </div>


                    <div className={isOpened ? "cardCreationPanel_InnerContainer active" : "cardCreationPanel_InnerContainer"}>
                        <div className="cardCreation_selectedCards">
                            <div className="header_selected_cards">
                                <h2>Selecetd Cards</h2>

                            </div>
                            <div className="inner_body_selecetd_cards">
                                {messageContext?.isLoading ? [1, 2, 3].map((item) => {
                                    return (
                                        <SkeltonLoading key={item} />
                                    )
                                }) : <>

                                    {selectedSourceCards.map((item) => {
                                        return (
                                            <SelectedCard item={item} RemoveSourceCard={RemoveSourceCard} />
                                        )
                                    })}
                                </>}


                            </div>
                        </div>
                        <div className="cardCreation_searchedCards">

                            <div className="header_searched_cards">
                                <h2>Searched Results</h2>
                            </div>

                            <div className="innerSearchedCardsContainer">
                                {messageContext?.isLoading ? [1, 2, 3].map((item) => {
                                    return (
                                        <SkeltonLoading key={item} isSearched={true} />
                                    )
                                }) : <>
                                    {messageContext?.sourceCards.map((item, idx) => {
                                        return (
                                            <SearchedCards item={item} key={idx} SelectSourceCard={SelectSourceCard} />
                                        )
                                    })}
                                </>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <SourceCardsPanel />
        </>
    )
}

export default CardCreationPanel
