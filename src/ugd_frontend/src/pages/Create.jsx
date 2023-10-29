import React, { useEffect, useState } from "react";
import SearchBar from "../header/SearchBar";
import AuthorPanel from "../the-greats/AuthorPanel";
import AUTHOR_INFO from "../../assets/author_data";
import MessageCard from "../cards/MessageCard/MessageCard";

function Create() {
  const [selectedAuthors, setSelectedAuthors] = useState(
    AUTHOR_INFO.map((author) => author.id)
  );
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    const image = require.context(
      "../../assets/public/images/",
      false,
      /\.(png|jpe?g|svg)$/
    );
  }, []);

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
        <SearchBar
          selectedAuthors={selectedAuthors}
          setSelectedAuthors={setSelectedAuthors}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
        />
        <div className="main-grid-container">
          <AuthorPanel
            authors={AUTHOR_INFO.filter(
              (author) =>
                selectedAuthors.includes(author.id) &&
                (selectedCategories.length === 0 ||
                  selectedCategories.some((cat) =>
                    author.category.includes(cat)
                  ))
            )}
          />
        </div>
      </div>
  );
}

export default Create;
