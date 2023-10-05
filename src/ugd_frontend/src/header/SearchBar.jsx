
// // OG
// import React, { useState, useCallback } from 'react';
// import AUTHOR_INFO from '../../assets/author_data';
// import { ugd_backend } from '../../../declarations/ugd_backend';
// import '../../styles/SearchBar.css'

// const SearchBar = () => {
//   const [searchValue, setSearchValue] = useState('');
//   const [data, setData] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [selectedAuthor, setSelectedAuthor] = useState('All Books');

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

//   return (
//     <div className="container mx-auto p-4">
//       <div className="searchSection flex items-center">
//         <select
//           className="form-select block w-1/4 mr-4"
//           onChange={handleAuthorChange}
//           defaultValue={selectedAuthor}
//         >
//           {/* Add an "All Books" option here */}
//           <option value="All Books">All Books</option>
//           {AUTHOR_INFO.map((author) => (
//             <option key={author.id} value={author.id}>
//               {author.id}
//             </option>
//           ))}
//         </select>
//         <div className="flex w-3/4">
//           <input
//             type="text"
//             className="form-input w-full"
//             placeholder="Type a topic or a query..."
//             onChange={handleSearchChange}
//           />
//           <button
//             className="bg-blue-500 text-white px-4 py-2 ml-2"
//             onClick={handleSearchSubmit}
//           >
//             Search
//           </button>
//         </div>
//       </div>

//       {isLoading ? (
//         <div className="loading mt-4">
//           <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
//         </div>
//       ) : (
//         data && <div className="greeting mt-4">{data}</div>
//       )}
//     </div>
//   );
// };

// export default SearchBar;



























// OG
import React, { useState, useCallback } from 'react';
import AUTHOR_INFO from '../../assets/author_data';
import { ugd_backend } from '../../../declarations/ugd_backend';
import '../../styles/SearchBar.css'

const SearchBar = () => {
  const [searchValue, setSearchValue] = useState('');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState('All Books');

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

  return (
    <div className="searchbar-container">
      <div className="searchbar-searchSection">
        <select
          className="searchbar-form-select"
          onChange={handleAuthorChange}
          defaultValue={selectedAuthor}
        >
          {/* Add an "All Books" option here */}
          <option value="All Books">Filter</option>
          {AUTHOR_INFO.map((author) => (
            <option key={author.id} value={author.id}>
              {author.id}
            </option>
          ))}
        </select>
        <div className="flex w-3/4"> {/* If "flex w-3/4" has specific styles associated, you should add "searchbar-" prefix to them as well */}
          <input
            type="text"
            className="searchbar-form-input"
            placeholder="Type a topic or a query..."
            onChange={handleSearchChange}
          />
          <button
            className="searchbar-bg-blue-500"
            onClick={handleSearchSubmit}
          >
            Search
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="searchbar-loading searchbar-mt-4">
          <div className="searchbar-loader"></div>
        </div>
      ) : (
        data && <div className="greeting searchbar-mt-4">{data}</div> 
        // Add "searchbar-" prefix to "greeting" if it has associated styles.
      )}
    </div>
  );
};

export default SearchBar;



















