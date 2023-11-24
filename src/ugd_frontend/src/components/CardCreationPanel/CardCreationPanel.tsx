import React from 'react'
import './cardCreationpanel.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookmark, faChevronDown, faXmark } from '@fortawesome/free-solid-svg-icons'

const CardCreationPanel: React.FC = () => {
    return (
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
                            {[1, 2, 3, 4].map((item) => {
                                return (
                                    <div className="selectedCardBx" key={item}>
                                        <div className="selectedCardImg">
                                            <img src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRnueWinC4q3VdHpsNmQ0AmELZuq310MASs-HLgwzwq7-4SHDC7" alt="" />
                                        </div>
                                        <div className="selectedCardBody">
                                            <div className="selectedBodyCardText">
                                                <h2>Hello world</h2>
                                                <p>description</p>
                                            </div>
                                            <div className="selectedBodyCardBtns">
                                                <label> <FontAwesomeIcon icon={faXmark} size='1x' /> </label>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className="cardCreation_searchedCards">

                        <div className="header_searched_cards">
                            <h2>Searched Results</h2>
                        </div>

                        <div className="innerSearchedCardsContainer">
                            {[1, 2, 3, 4, 5].map((item) => {
                                return (
                                    <div className="searchedCardBx" key={item}>
                                        <div className="innerSaerchedCardBx">
                                            <div className="searchedCardimg">
                                                <img src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRnueWinC4q3VdHpsNmQ0AmELZuq310MASs-HLgwzwq7-4SHDC7" alt="" />
                                            </div>
                                            <div className="searchecCardText">
                                                <div className="innerSearchedTextData">
                                                    <h2>The Expression of the Emotions in Man and Animals</h2>
                                                    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quod reiciendis commodi adipisci reprehenderit quis provident aliquid, tempora quas laudantium eaque ut dolorum repellendus. Exercitationem veniam repudiandae est voluptas quisquam dignissimos iusto iste cupiditate aliquam earum, pariatur accusantium, optio, beatae architecto? sit amet consectetur adipisicing elit. Quod reiciendis commodi adipisci reprehenderit quis provident aliquid, tempora quas laudantium eaque ut dolorum repellendus. Exercitationem veniam repudiandae est voluptas quisquam dignissimos iusto iste cupiditate aliquam earum, pariatur accusantium, optio, beatae architecto?</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="showSerachedCardsActionBtns">
                                            <button> <label><FontAwesomeIcon icon={faBookmark} size='sm' /></label> Bookmark</button>
                                            <button> <label><FontAwesomeIcon icon={faChevronDown} size='sm' /></label> Show Details</button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CardCreationPanel
