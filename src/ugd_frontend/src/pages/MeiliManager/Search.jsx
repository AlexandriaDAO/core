// Basic search for If/When we want to add, but this will likely be replaced with instantsearch.
import React, { useState, useEffect } from 'react';
import useMeiliSearchClient from '../../utils/MeiliSearchClient';


const Search = ({ selectedIndex }) => {
  const { client, loading } = useMeiliSearchClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    if(!searchTerm) {
      alert('Type something to search...')
      return;
    }
    const results = await client.index(selectedIndex).search(searchTerm);
    setSearchResults(results.hits);
  };

  useEffect(() => {
    // Reset search results when the index changes
    setSearchResults([]);
  }, [selectedIndex]);

  return (
    <div className='flex flex-col items-start gap-1'>
      <input
        type="text"
        placeholder="Search term"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch} disabled={!searchTerm} className={`${!searchTerm ? 'bg-green-200 border-green-500 border': 'bg-green-400 hover:bg-green-300'} text-black  px-2 transition-all duration-300 rounded`}>Search</button>
      <div className='flex flex-col gap-4'>
        {searchResults.map((result, index) => (
          <div key={index}>
            {Object.keys(result).map((key) => (
              <div key={key} className='flex gap-2'>
                <span className='font-semibold'>{key}</span>
                <span>{result[key]}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;