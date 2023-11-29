import React, { useContext, useEffect, useState } from "react";
import SearchBar from "../header/SearchBar";
import AuthorPanel from "../the-greats/AuthorPanel";
import AUTHOR_INFO from "../data/author_data";
import CardCreationPanel from "../components/CardCreationPanel/CardCreationPanel";
import MessageContext from "../contexts/MessageContext";
import MessageCard from "../cards/MessageCard/MessageCard";

function Create() {
  const [selectedAuthors, setSelectedAuthors] = useState(
    AUTHOR_INFO.map((author) => author.id)
  );
  const [selectedCategories, setSelectedCategories] = useState([]);
  const { message, currentAuthorId } = useContext(MessageContext);

  let authors = AUTHOR_INFO.filter(
    (author) =>
      selectedAuthors.includes(author.id) &&
      (selectedCategories.length === 0 ||
        selectedCategories.some((cat) => author.category.includes(cat)))
  );

  return (
    <div className="h-full w-full relative">
      <SearchBar
        selectedAuthors={selectedAuthors}
        setSelectedAuthors={setSelectedAuthors}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
      />
      {message && <CardCreationPanel currentAuthorId={currentAuthorId} />}
      <div className="main-grid-container">
        {message ? (
          <div
            className="shareCardsMainContainer"
            style={{ background: "#f6f7fb", paddingBottom: "20px" }}
          >
            <div className="sharedCardsInnerContainer">
              {authors?.map((item) => {
                return (
                  <div key={item.id}>
                    <MessageCard AuthorId={item.id} isShared={true} />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <AuthorPanel authors={authors} />
        )}
      </div>
    </div>
  );
}

export default Create;
