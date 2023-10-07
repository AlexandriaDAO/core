import React from 'react';
import AUTHOR_INFO from '../../assets/author_data';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faBars } from '@fortawesome/free-solid-svg-icons';

const AuthorFilter = ({ isDropdownVisible, toggleDropdown, selectedAuthors, handleAuthorSelection, handleAllBooksSelection }) => (
  <>
    <button className="filter-icon-button" onClick={toggleDropdown}>
      <FontAwesomeIcon icon={isDropdownVisible ? faTimes : faBars} />
    </button>
    {isDropdownVisible && (
      <div className="filter-popup">
        <div className="filter-item">
          <input 
            type="checkbox" 
            id="all-books" 
            checked={selectedAuthors.length === AUTHOR_INFO.length}
            onChange={handleAllBooksSelection}
          />
          <label htmlFor="all-books">All Books</label>
        </div>
        {AUTHOR_INFO.map(author => (
          <div key={author.id} className="filter-item">
            <input 
              type="checkbox"
              id={author.id}
              checked={selectedAuthors.includes(author.id)}
              onChange={() => handleAuthorSelection(author.id)}
            />
            <label htmlFor={author.id}>{author.id}</label>
          </div>
        ))}
      </div>
    )}
  </>
);

export default AuthorFilter;
