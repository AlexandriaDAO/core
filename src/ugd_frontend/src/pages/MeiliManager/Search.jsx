// Basic search for If/When we want to add, but this will likely be replaced with instantsearch.


import React, { useState, useEffect } from 'react';
import client from '../../utils/MeiliSearchClient'; // Adjust the path as necessary

const Search = ({ selectedIndex }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    const results = await client.index(selectedIndex).search(searchTerm);
    setSearchResults(results.hits);
  };

  useEffect(() => {
    // Reset search results when the index changes
    setSearchResults([]);
  }, [selectedIndex]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search term"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      <div>
        {searchResults.map((result, index) => (
          <div key={index}>
            {Object.keys(result).map((key) => (
              <p key={key}>{`${key}: ${result[key]}`}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;


