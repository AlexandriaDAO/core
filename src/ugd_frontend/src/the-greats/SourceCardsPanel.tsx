import MessageCard from '@/cards/MessageCard/MessageCard';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react'
import '../styles/sourcecardspanel.css'

const SourceCardsPanel: React.FC = () => {
  const [isOpened, setIsOpened] = useState(true)
  const [sourceCards, setSourceCards] = useState<any[]>()


  useEffect(() => {

  }, [])

  return (
    <div
      className="shareCardsMainContainer"
      style={{ paddingBottom: "20px" }}
    >
      <div className="header_bookkmarkedSourceCards">
        <div className="innerBookmarked_header">
          <h2>Bookmarked Cards</h2>
          <button onClick={() => setIsOpened(!isOpened)}><FontAwesomeIcon icon={isOpened ? faChevronUp : faChevronDown} size='sm' /></button>
        </div>
      </div>
      <div className={isOpened ? "sharedCardsInnerContainer active" : "sharedCardsInnerContainer"}>

      </div>
    </div>
  )
}

export default SourceCardsPanel
