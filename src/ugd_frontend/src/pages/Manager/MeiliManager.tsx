// import React, { useState } from 'react';
// import { MeiliSearch, Index, SearchResponse } from 'meilisearch';

// interface Book {
//   // Define the structure of your book records here
//   [key: string]: any; // Placeholder, adjust according to your data structure
// }

// const client = new MeiliSearch({
//   host: process.env.MEILI_DOMAIN || 'https://app-uncensoredgreats-dev-001.azurewebsites.net/',
//   apiKey: process.env.MEILI_MASTER_KEY || '85238b14-cf2f-4066-a822-bd2b4dd18de0'
// });

// const MeiliManager: React.FC = () => {
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const [searchResults, setSearchResults] = useState<Book[]>([]);
//   const [indexes, setIndexes] = useState<Index[]>([]); // Assuming Index is the correct type from MeiliSearch client

//   const handleSearch = async () => {
//     const results = await client.index('books').search<Book>(searchTerm);
//     setSearchResults(results.hits);
//   };

//   const getIndexes = async () => {
//     const allIndexes = await client.getIndexes();
//     setIndexes(allIndexes.results); // Adjust according to the actual structure of getIndexes response
//   };

//   const createIndex = async (indexName: string) => {
//     try {
//       await client.createIndex(indexName, { primaryKey: 'id' });
//       alert(`Index ${indexName} created successfully!`);
//       // Optionally, refresh the indexes list here
//     } catch (error) {
//       alert(`Error creating index: ${error}`);
//     }
//   };

//   const deleteIndex = async (indexName: string) => {
//     try {
//       await client.deleteIndex(indexName);
//       alert(`Index ${indexName} deleted successfully!`);
//       // Optionally, refresh the indexes list here
//     } catch (error) {
//       alert(`Error deleting index: ${error}`);
//     }
//   };

//   return (
//     <div>
//       <input
//         type="text"
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//       />
//       <button onClick={handleSearch}>Search</button>
//       <button onClick={getIndexes}>Get Indexes</button>
//       <button onClick={() => createIndex('movies')}>Create Movies Index</button>
//       <button onClick={() => deleteIndex('movies')}>Delete Movies Index</button>
//       {searchResults.map((result, index) => (
//         <div key={index}>
//           {Object.keys(result).map((key) => (
//             <p key={key}>{`${key}: ${result[key]}`}</p>
//           ))}
//         </div>
//       ))}
//       <div>
//         <h3>Indexes:</h3>
//         {indexes.map((index, idx) => (
//           <p key={idx}>{index.name}</p>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default MeiliManager;





import React, { useState } from 'react';
import { MeiliSearch, Stats } from 'meilisearch';

const client = new MeiliSearch({
  host: process.env.MEILI_DOMAIN || 'https://app-uncensoredgreats-dev-001.azurewebsites.net/',
  apiKey: process.env.MEILI_MASTER_KEY || '85238b14-cf2f-4066-a822-bd2b4dd18de0'
});

interface IndexStats {
  uid: string;
  numberOfDocuments: number;
  isIndexing: boolean;
}
const MeiliManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [indexes, setIndexes] = useState<IndexStats[]>([]);

  const handleSearch = async () => {
    const results = await client.index('books').search(searchTerm);
    setSearchResults(results.hits);
  };

  const getStats = async () => {
    const allStats: Stats = await client.getStats();
    const indexStats: IndexStats[] = Object.keys(allStats.indexes).map((indexName) => {
      const index = allStats.indexes[indexName];
      return {
        uid: indexName,
        numberOfDocuments: index.numberOfDocuments,
        isIndexing: index.isIndexing,
      };
    });
    setIndexes(indexStats);
  };

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Search term"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div>
        <button onClick={getStats}>Get All Stats</button>
      </div>
      {searchResults.map((result, index) => (
        <div key={index}>
          {Object.keys(result).map((key) => (
            <p key={key}>{`${key}: ${result[key]}`}</p>
          ))}
        </div>
      ))}
      <div>
        <h3>Indexes and Stats:</h3>
        {indexes.map((index, idx) => (
          <div key={idx}>
            <p>Index Name: {index.uid}</p>
            <p>Number of Documents: {index.numberOfDocuments}</p>
            <p>Is Indexing: {index.isIndexing ? 'Yes' : 'No'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeiliManager;