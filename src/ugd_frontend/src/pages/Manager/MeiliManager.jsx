// MeiliManager.jsx
import React, { useState } from 'react';
import SearchComponent from './Search';
import Stats from './Stats';

const MeiliManager = () => {
  const [selectedIndex, setSelectedIndex] = useState('books');
  const [indexes, setIndexes] = useState({});

  return (
    <div>
      <select value={selectedIndex} onChange={(e) => setSelectedIndex(e.target.value)}>
        {/* <option value="movies">Movies</option>
        <option value="books">Books</option> */}
        {/* Users can add their index to the backend here. */}
      </select>
      <SearchComponent selectedIndex={selectedIndex} />
      <Stats selectedIndex={selectedIndex} indexes={indexes} setIndexes={setIndexes} />
    </div>
  );
};

export default MeiliManager;
