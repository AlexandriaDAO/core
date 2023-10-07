// // OG
// import React, { useState, useCallback } from 'react';
// import AUTHOR_INFO from '../../assets/author_data';
// import { ugd_backend } from '../../../declarations/ugd_backend';
// import '../../styles/SearchBar.css'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faBars , faSearch } from '@fortawesome/free-solid-svg-icons';


// const SearchBar = () => {
//   const [searchValue, setSearchValue] = useState('');
//   const [data, setData] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [selectedAuthor, setSelectedAuthor] = useState('All Books');
//   const [isDropdownVisible, setIsDropdownVisible] = useState(false);


//   const handleAuthorChange = (event) => setSelectedAuthor(event.target.value);
//   const handleSearchChange = (event) => setSearchValue(event.target.value);

//   const handleSearchSubmit = useCallback(async () => {
//     if (searchValue.trim() !== '') {
//       setIsLoading(true);
//       try {
//         const response = await ugd_backend.greet(searchValue);
//         setData(response);
//       } catch (error) {
//         console.error("Failed to fetch the greeting:", error);
//       }
//       setIsLoading(false);
//     }
//   }, [searchValue]);

//   const toggleDropdown = () => {
//     setIsDropdownVisible(!isDropdownVisible);
//   };

//   return (
//     <div className="searchbar-wrapper">
//       <div className="searchbar">
//         <button className="filter-icon-button" onClick={toggleDropdown}>
//           <FontAwesomeIcon icon={faBars} />
//         </button>
        
//         <div className={`dropdown ${isDropdownVisible ? 'visible' : ''}`}>
//           <div className="dropdown-item" onClick={() => handleAuthorChange('All Books')}></div>
//           {AUTHOR_INFO.map(author => (
//             <div 
//               key={author.id} 
//               className="dropdown-item" 
//               onClick={() => handleAuthorChange(author.id)}
//             >
//               {author.id}
//             </div>
//           ))}
//         </div>

//         <input
//           type="text"
//           className="search-input"
//           placeholder="Type a topic or a query..."
//           onChange={handleSearchChange}
//         />

//         <button className="search-icon-button" onClick={handleSearchSubmit}>
//           <FontAwesomeIcon icon={faSearch} />
//         </button>
//       </div>

//       {isLoading ? (
//         <div className="loading-indicator">
//           <div className="loader"></div>
//         </div>
//       ) : (
//         data && <div className="greeting">{data}</div>
//       )}
//     </div>
//   );  
// };

// export default SearchBar;






















// // Nice checkbox filter instead of dropdown. 
// import React, { useState, useCallback } from 'react';
// import AUTHOR_INFO from '../../assets/author_data';
// import { ugd_backend } from '../../../declarations/ugd_backend';
// import '../../styles/SearchBar.css';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faBars, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

// const SearchBar = () => {
  // const [searchValue, setSearchValue] = useState('');
  // const [data, setData] = useState(null);
  // const [isLoading, setIsLoading] = useState(false);
  // const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  // const [selectedAuthors, setSelectedAuthors] = useState([]);

  // const handleSearchChange = event => setSearchValue(event.target.value);

  // const handleSearchSubmit = useCallback(async () => {
  //   if (searchValue.trim()) {
  //     setIsLoading(true);
  //     try {
  //       const response = await ugd_backend.greet(searchValue);
  //       setData(response);
  //     } catch (error) {
  //       console.error("Failed to fetch the greeting:", error);
  //     }
  //     setIsLoading(false);
  //   }
  // }, [searchValue]);

  // const toggleDropdown = () => setIsDropdownVisible(prev => !prev);

  // const handleAuthorSelection = authorId => setSelectedAuthors(prevAuthors => 
  //   prevAuthors.includes(authorId) ? prevAuthors.filter(id => id !== authorId) : [...prevAuthors, authorId]);

  // const handleAllBooksSelection = () => setSelectedAuthors(
  //   selectedAuthors.length === AUTHOR_INFO.length ? [] : AUTHOR_INFO.map(author => author.id)
  // );

//   return (
//     <div className="searchbar-wrapper">
//       <div className="searchbar">
//         <button className="filter-icon-button" onClick={toggleDropdown}>
//           <FontAwesomeIcon icon={isDropdownVisible ? faTimes : faBars} />
//         </button>
//         {isDropdownVisible && (
//           <div className="filter-popup">
//             <div className="filter-item">
//               <input 
//                 type="checkbox" 
//                 id="all-books" 
//                 checked={selectedAuthors.length === AUTHOR_INFO.length}
//                 onChange={handleAllBooksSelection}
//               />
//               <label htmlFor="all-books">All Books</label>
//             </div>
//             {AUTHOR_INFO.map(author => (
//               <div key={author.id} className="filter-item">
//                 <input 
//                   type="checkbox"
//                   id={author.id}
//                   checked={selectedAuthors.includes(author.id)}
//                   onChange={() => handleAuthorSelection(author.id)}
//                 />
//                 <label htmlFor={author.id}>{author.id}</label>
//               </div>
//             ))}
//           </div>
//         )}
//         <input
//           type="text"
//           className="search-input"
//           placeholder="Type a topic or a query..."
//           onChange={handleSearchChange}
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













import React, { useState, useCallback } from 'react';
import AUTHOR_INFO from '../../assets/author_data';
import { ugd_backend } from '../../../declarations/ugd_backend';
import '../../styles/SearchBar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import AuthorFilter from './AuthorFilter';

const SearchBar = () => {
  const [searchValue, setSearchValue] = useState('');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [selectedAuthors, setSelectedAuthors] = useState([]);

  const handleSearchChange = event => setSearchValue(event.target.value);

  const handleSearchSubmit = useCallback(async () => {
    if (searchValue.trim()) {
      setIsLoading(true);
      try {
        const response = await ugd_backend.greet(searchValue);
        setData(response);
      } catch (error) {
        console.error("Failed to fetch the message:", error);
      }
      setIsLoading(false);
    }
  }, [searchValue]);

  const toggleDropdown = () => setIsDropdownVisible(prev => !prev);

  const handleAuthorSelection = authorId => setSelectedAuthors(prevAuthors => 
    prevAuthors.includes(authorId) ? prevAuthors.filter(id => id !== authorId) : [...prevAuthors, authorId]);

  const handleAllBooksSelection = () => setSelectedAuthors(
    selectedAuthors.length === AUTHOR_INFO.length ? [] : AUTHOR_INFO.map(author => author.id)
  );

  return (
    <div className="searchbar-wrapper">
      <div className="searchbar">
        <AuthorFilter 
          isDropdownVisible={isDropdownVisible}
          toggleDropdown={toggleDropdown}
          selectedAuthors={selectedAuthors}
          handleAuthorSelection={handleAuthorSelection}
          handleAllBooksSelection={handleAllBooksSelection}
        />
        <input
          type="text"
          className="search-input"
          placeholder="Type a topic or a query..."
          onChange={handleSearchChange}
        />
        <button className="search-icon-button" onClick={handleSearchSubmit}>
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </div>
      {isLoading ? (
        <div className="loading-indicator"><div className="loader"></div></div>
      ) : data && <div className="greeting">{data}</div>}
    </div>
  );
};

export default SearchBar;
