import MessageCard from '@/cards/MessageCard/MessageCard';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react'
import '../styles/sourcecardspanel.css'

const SourceCardsPanel: React.FC = ({ authors }: any) => {

  const [isOpened, setIsOpened] = useState(true)

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
        {authors?.map((item: any) => {
          return (
            <div key={item.id}>
              <MessageCard AuthorId={item.id} isShared={true} />
            </div>
          );
        })}
      </div>
    </div>
  )
}

export default SourceCardsPanel
