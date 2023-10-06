// Mobile freindly version w/ icons
import React, { useState, useCallback } from 'react';
import AUTHOR_INFO from '../../assets/author_data';
import { ugd_backend } from '../../../declarations/ugd_backend';
import '../../styles/SearchBar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars , faSearch } from '@fortawesome/free-solid-svg-icons';


const SearchBar = () => {
  const [searchValue, setSearchValue] = useState('');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState('All Books');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);


  const handleAuthorChange = (event) => setSelectedAuthor(event.target.value);
  const handleSearchChange = (event) => setSearchValue(event.target.value);

  const handleSearchSubmit = useCallback(async () => {
    if (searchValue.trim() !== '') {
      setIsLoading(true);
      try {
        const response = await ugd_backend.greet(searchValue);
        setData(response);
      } catch (error) {
        console.error("Failed to fetch the greeting:", error);
      }
      setIsLoading(false);
    }
  }, [searchValue]);

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  return (
    <div className="searchbar-wrapper">
      <div className="searchbar">
        <button className="filter-icon-button" onClick={toggleDropdown}>
          <FontAwesomeIcon icon={faBars} />
        </button>
        
        <div className={`dropdown ${isDropdownVisible ? 'visible' : ''}`}>
          <div className="dropdown-item" onClick={() => handleAuthorChange('All Books')}></div>
          {AUTHOR_INFO.map(author => (
            <div 
              key={author.id} 
              className="dropdown-item" 
              onClick={() => handleAuthorChange(author.id)}
            >
              {author.id}
            </div>
          ))}
        </div>

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
        <div className="loading-indicator">
          <div className="loader"></div>
        </div>
      ) : (
        data && <div className="greeting">{data}</div>
      )}
    </div>
  );  
};

export default SearchBar;


