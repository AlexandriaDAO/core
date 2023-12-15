import React, { useState } from "react";
import MessageCard from "../cards/MessageCard/MessageCard";
import AUTHOR_INFO from "../data/author_data";
import "../styles/sharePage.css";

const Share = () => {
  const [selectedAuthors, setSelectedAuthors] = useState(
    AUTHOR_INFO.map((author) => author.id)
  );
  const [selectedCategories, setSelectedCategories] = useState([]);
  let authors = AUTHOR_INFO.filter(
    (author) =>
      selectedAuthors.includes(author.id) &&
      (selectedCategories.length === 0 ||
        selectedCategories.some((cat) => author.category.includes(cat)))
  );

  return (
    <div className="mainSharePageContainer">
      <div className="innerSharePageContainer">
        {/* HEADER CONTAINER */}
        <div className="sharePageHeaderContainer"></div>
        {/* HEADER CONTAINER */}

        {/* MAIN BODY  */}

        <div className="shareCardsMainContainer">
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

        {/* MAIN BODY  */}
      </div>
    </div>
  );
};

export default Share;
