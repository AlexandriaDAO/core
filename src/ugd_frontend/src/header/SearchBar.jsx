// // OG
// import React, { useState, useCallback } from 'react';
// import AUTHOR_INFO from '../../assets/author_data';
// import { ugd_backend } from '../../../declarations/ugd_backend';
// import '../../styles/SearchBar.css';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faSearch } from '@fortawesome/free-solid-svg-icons';
// import AuthorFilter from './AuthorFilter';

// const SearchBar = ({ selectedAuthors, setSelectedAuthors, selectedCategories, setSelectedCategories }) => {
//   const [searchValue, setSearchValue] = useState('');
//   const [data, setData] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  
//   const allCategories = [...new Set(AUTHOR_INFO.flatMap(author => author.category))];

//   const handleSearchChange = event => setSearchValue(event.target.value);

//   const handleSearchSubmit = useCallback(async () => {
//     if (searchValue.trim()) {
//       setIsLoading(true);
//       try {
//         const response = await ugd_backend.mc_front(searchValue);
//         setData(response);
//       } catch (error) {
//         console.error("Failed to fetch the message:", error);
//       }
//       setIsLoading(false);
//     }
//   }, [searchValue]);

//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();
//       handleSearchSubmit();
//     }
//   };

//   const toggleDropdown = () => setIsDropdownVisible(prev => !prev);

//   const handleAuthorSelection = authorId => setSelectedAuthors(prevAuthors => 
//     prevAuthors.includes(authorId) ? prevAuthors.filter(id => id !== authorId) : [...prevAuthors, authorId]);

//   const handleAllBooksSelection = () => setSelectedAuthors(
//     selectedAuthors.length === AUTHOR_INFO.length ? [] : AUTHOR_INFO.map(author => author.id)
//   );

//   const handleCategorySelection = category => setSelectedCategories(prevCategories =>
//     prevCategories.includes(category) ? prevCategories.filter(cat => cat !== category) : [...prevCategories, category]);

//   return (
//     <div className="searchbar-wrapper">
//       <div className="searchbar">
//         <AuthorFilter 
//           isDropdownVisible={isDropdownVisible}
//           toggleDropdown={toggleDropdown}
//           selectedAuthors={selectedAuthors}
//           handleAuthorSelection={handleAuthorSelection}
//           handleAllBooksSelection={handleAllBooksSelection}
//           allCategories={allCategories}
//           selectedCategories={selectedCategories}
//           handleCategorySelection={handleCategorySelection}
//         />
//         <input
//           type="text"
//           className="search-input"
//           placeholder="Type a topic or a query..."
//           onChange={handleSearchChange}
//           onKeyDown={handleKeyDown}
//         />
//         <button className="search-icon-button" onClick={handleSearchSubmit}>
//           <FontAwesomeIcon icon={faSearch} />
//         </button>
//       </div>
//       {isLoading ? (
//         <div className="loading-indicator"><div className="loader"></div></div>
//       ) : data && <div className="greeting">{data}</div>}
//     </div>
//   );
// };

// export default SearchBar;
















// // Trying to use context instead of direct api call.
// import React, { useState, useCallback, useContext } from 'react';
// import AUTHOR_INFO from '../../assets/author_data';
// import '../../styles/SearchBar.css';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faSearch } from '@fortawesome/free-solid-svg-icons';
// import AuthorFilter from './AuthorFilter';
// import MessageContext from '../../src/contexts/MessageContext';

// const SearchBar = ({ selectedAuthors, setSelectedAuthors, selectedCategories, setSelectedCategories }) => {
//   const [searchValue, setSearchValue] = useState('');
//   const [isDropdownVisible, setIsDropdownVisible] = useState(false);

//   const allCategories = [...new Set(AUTHOR_INFO.flatMap(author => author.category))];

//   const handleSearchChange = event => setSearchValue(event.target.value);

//   const messageContext = useContext(MessageContext);

//   if (!messageContext) {
//     throw new Error("SearchBar must be used within a MessageProvider");
//   }

//   const { message, updateMessage } = messageContext;

//   const handleSearchSubmit = useCallback(() => {
//     if (searchValue.trim()) {
//       updateMessage(searchValue);
//     }
//   }, [searchValue, updateMessage]);

//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();
//       handleSearchSubmit();
//     }
//   };

//   const toggleDropdown = () => setIsDropdownVisible(prev => !prev);

//   const handleAuthorSelection = authorId => setSelectedAuthors(prevAuthors => 
//     prevAuthors.includes(authorId) ? prevAuthors.filter(id => id !== authorId) : [...prevAuthors, authorId]);

//   const handleAllBooksSelection = () => setSelectedAuthors(
//     selectedAuthors.length === AUTHOR_INFO.length ? [] : AUTHOR_INFO.map(author => author.id)
//   );

//   const handleCategorySelection = category => setSelectedCategories(prevCategories =>
//     prevCategories.includes(category) ? prevCategories.filter(cat => cat !== category) : [...prevCategories, category]);

//   return (
//     <div className="searchbar-wrapper">
//       <div className="searchbar">
//         <AuthorFilter 
//           isDropdownVisible={isDropdownVisible}
//           toggleDropdown={toggleDropdown}
//           selectedAuthors={selectedAuthors}
//           handleAuthorSelection={handleAuthorSelection}
//           handleAllBooksSelection={handleAllBooksSelection}
//           allCategories={allCategories}
//           selectedCategories={selectedCategories}
//           handleCategorySelection={handleCategorySelection}
//         />
//         <input
//           type="text"
//           className="search-input"
//           placeholder="Type a topic or a query..."
//           onChange={handleSearchChange}
//           onKeyDown={handleKeyDown}
//         />
//         <button className="search-icon-button" onClick={handleSearchSubmit}>
//           <FontAwesomeIcon icon={faSearch} />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default SearchBar;











// Revised trying to use context instead of direct api call.
import React, { useState, useCallback, useContext } from 'react';
import AUTHOR_INFO from '../../assets/author_data';
import '../../styles/SearchBar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import AuthorFilter from './AuthorFilter';
import MessageContext from '../../src/contexts/MessageContext';

const SearchBar = ({ selectedAuthors, setSelectedAuthors, selectedCategories, setSelectedCategories }) => {
  const [searchValue, setSearchValue] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const allCategories = [...new Set(AUTHOR_INFO.flatMap(author => author.category))];

  const handleSearchChange = event => setSearchValue(event.target.value);

  const messageContext = useContext(MessageContext);

  if (!messageContext) {
    throw new Error("SearchBar must be used within a MessageProvider");
  }

  const { message, updateMessage, isLoading, error } = messageContext;

  const handleSearchSubmit = useCallback(() => {
    if (searchValue.trim()) {
      updateMessage(searchValue);
    }
  }, [searchValue, updateMessage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  const toggleDropdown = () => setIsDropdownVisible(prev => !prev);

  const handleAuthorSelection = authorId => setSelectedAuthors(prevAuthors => 
    prevAuthors.includes(authorId) ? prevAuthors.filter(id => id !== authorId) : [...prevAuthors, authorId]);

  const handleAllBooksSelection = () => setSelectedAuthors(
    selectedAuthors.length === AUTHOR_INFO.length ? [] : AUTHOR_INFO.map(author => author.id)
  );

  const handleCategorySelection = category => setSelectedCategories(prevCategories =>
    prevCategories.includes(category) ? prevCategories.filter(cat => cat !== category) : [...prevCategories, category]);

  return (
    <div className="searchbar-wrapper">
      <div className="searchbar">
        <AuthorFilter 
          isDropdownVisible={isDropdownVisible}
          toggleDropdown={toggleDropdown}
          selectedAuthors={selectedAuthors}
          handleAuthorSelection={handleAuthorSelection}
          handleAllBooksSelection={handleAllBooksSelection}
          allCategories={allCategories}
          selectedCategories={selectedCategories}
          handleCategorySelection={handleCategorySelection}
        />
        <input
          type="text"
          className="search-input"
          placeholder="Type a topic or a query..."
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
        />
        <button className="search-icon-button" onClick={handleSearchSubmit}>
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </div>
      {isLoading ? (
            <div className="loading-indicator"><div className="loader"></div></div>
        ) : error ? (
            <div className="error-message">{error}</div>
        ) : message && <div className="greeting">{message}</div>}
    </div>
  );
};

export default SearchBar;