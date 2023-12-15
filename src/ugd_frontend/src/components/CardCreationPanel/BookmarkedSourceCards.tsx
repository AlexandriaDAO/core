import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useEffect, useState } from 'react'
import '../../styles/sourcecardspanel.css'
import { ugd_backend } from '../../declarations/ugd_backend';
import { BookMarkedSourceCardContext } from '@/utils/BookMarkedSourceCardProvider';
import SearchedCards from '@/components/CardCreationPanel/SearchedCards';


interface BookmarkedSourceCardInterface {
  SelectSourceCard?: (newItem: any) => void
}

const BookmarkedSourceCards: React.FC<BookmarkedSourceCardInterface> = ({ SelectSourceCard }) => {
  const BookMarkedContext = useContext(BookMarkedSourceCardContext)
  const [isOpened, setIsOpened] = useState(true)

  useEffect(() => {
    const getBookmarkedSources = async () => {
      try {
        const response = await ugd_backend.get_bookmarks()
        let responseArray: any = response.map((item) => item[0])
        BookMarkedContext?.SetBookmarkedSourceCards(responseArray)
      } catch (error) {
        console.log(`Error while fetching bookmarked source cards: ${error}`)
      }
    }

    getBookmarkedSources()
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
      <div className={isOpened ? "bookmarkedCardsInnerContainer active" : "bookmarkedCardsInnerContainer"}>
        {BookMarkedContext?.bookmarkedSourceCards?.map((item) => {
          return (
            <SearchedCards item={item} key={item.post_id} SelectSourceCard={SelectSourceCard} />
          )
        })}
      </div>
    </div>
  )
}

export default BookmarkedSourceCards
