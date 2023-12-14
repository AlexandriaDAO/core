import React, { MouseEventHandler, useEffect, useState } from 'react'
import './authorcards.css'
import RatingCard from '../../RatingCard/RatingCard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBook, faChevronDown, faChevronUp, faClose, faDollarSign, faHamburger, faHeart, faNavicon, faRotateForward } from '@fortawesome/free-solid-svg-icons'
import { faHeart as faRegularHeart } from '@fortawesome/free-regular-svg-icons'
import { useAuthors } from '@/contexts/AuthorContext'
import useStreamingText from '@/utils/Stream'

interface AuthorCardsInterface {
    author: any
    HandleDragStatus: (dragStatus: boolean) => {},
    isDraggable: boolean,
}

const AuthorCards: React.FC<AuthorCardsInterface> = ({ author, HandleDragStatus, isDraggable }) => {
    const { stats, setStats, shelf, setShelf } = useAuthors();

    if (!author) {
        return null;
    }

    const [isFavourite, setIsFavourite] = useState(false)
    const [flipped, setFlipped] = useState(false);
    const [streamed, setStreamed] = useState(false);

    const streamedDescription = useStreamingText(author.description, 10, streamed);

    useEffect(() => {

        if (flipped && !streamed) {
            setStreamed(true);
        }
    }, [flipped]);


    const handleToggleCardFlip = () => {
        setFlipped(!flipped)
        setStats(null);
        setShelf(null);
    }



    return (
        <div className={`mainAuthorCard ${flipped ? 'flipped' : ''}`} >
            <div className="AuthorInnerCardDetails">
                <div className="innerAuthorCard flip-front">
                    <div className="AuthorCardImage" >
                        <img src={`/images/authors/${author.id}.png`} alt="" />

                        <div className="favouriteButton">

                            <button onMouseEnter={() => HandleDragStatus(true)} onTouchStart={() => HandleDragStatus(true)} onMouseLeave={() => HandleDragStatus(false)} onTouchEnd={() => {
                                setTimeout(() => {
                                    HandleDragStatus(false)
                                }, 1000);
                            }}><FontAwesomeIcon icon={faNavicon} color={'gray'} type="regular" size="sm" /></button>
                            <button onClick={() => setIsFavourite(!isFavourite)}><FontAwesomeIcon icon={isFavourite ? faHeart : faRegularHeart} color={isFavourite ? '#D7080D' : 'gray'} type="regular" size="sm" /></button>
                        </div>

                    </div>
                    <div className="authorCardDetails">
                        <h2>{author.id}</h2>
                        <div className="authorRatings">
                            <RatingCard size={16} />
                        </div>
                    </div>
                    <div className="authorCardCalltoActions">
                        {stats === author.id ? <button onClick={() => setStats(null)}>Hide Details <span><FontAwesomeIcon icon={faChevronUp} size='1x' color='gray' /></span></button> : <button onClick={() => setStats(author.id)}>Show Details <span><FontAwesomeIcon icon={faChevronDown} size='1x' color='gray' /></span></button>}
                        <button onClick={handleToggleCardFlip}> <FontAwesomeIcon icon={faRotateForward} size="lg" color='gray' /> </button>
                    </div>


                    {/* ------------------------- STATS DATA ----------------------------- */}

                    {stats === author.id && <div className="authorCardStatsContainer">
                        <div className="autorCardStatsDetails">
                            <div className="authorCardStatsBx">
                                <h4>TTS :</h4><label>3.6m</label>
                            </div>
                            <div className="authorCardStatsBx">
                                <h4>CPT :</h4><label>$0.024</label>
                            </div>
                            <div className="authorCardStatsBx">
                                <h4>30d :</h4><label>623K</label>
                            </div>
                            <div className="authorCardStatsBx">
                                <h4>MP :</h4><label>$15</label>
                            </div>
                            <div className="authorCardStatsBx">
                                <h4>CBT :</h4><label>$0.004</label>
                            </div>
                            <div className="authorCardStatsBx">
                                <h4>90d :</h4><label>923K</label>
                            </div>
                            <div className="authorCardStatsBx">
                                <h4>AP :</h4><label>--</label>
                            </div>
                            <div className="authorCardStatsBx">
                                <h4>Age :</h4><label>8 mo</label>
                            </div>
                            <div className="authorCardStatsBx column">
                                <h4>AI-Model </h4><label>Lamma-002</label>
                            </div>
                            <div className="authorCardStatsBx column">
                                <h4>Vectors </h4><label>Ada-002</label>
                            </div>
                        </div>

                        <div className="traningTokensDetails">
                            <h2 className='traningTokenHeading'>Training</h2>

                            <div className="innerTrainingTkens">
                                <label>#5.21G Tokens</label>
                                <label>#35 Books</label>
                                <label>#32 Bs</label>
                                <label>#57,278 cells</label>
                                <label>#5.21G Tokens</label>
                            </div>
                        </div>
                    </div>}

                    {/* ------------------------- STATS DATA ----------------------------- */}

                </div>

                <div className="authorCardBackContainer flip-back">
                    <div className="innerAuthorCardBackContainer">
                        <div className="authorCardBackTags">
                            {author.category.map((item: string, index: number) => {
                                return (
                                    <label key={index}>#{item}</label>
                                )
                            })}


                        </div>
                        <div className="authorCardBackDescription">
                            <p>{streamedDescription} </p>
                        </div>
                        <div className="authorCardBackCallToActions">
                            <button onClick={() => setShelf(shelf == author.id ? null : author.id)}> <label><FontAwesomeIcon icon={faBook} size='sm' color='gray' /></label>  Read</button>
                            <button onClick={handleToggleCardFlip}><FontAwesomeIcon icon={faRotateForward} size="1x" color='gray' /></button>
                            <button><label><FontAwesomeIcon icon={faDollarSign} size='sm' color='gray' /></label> Buy</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthorCards
