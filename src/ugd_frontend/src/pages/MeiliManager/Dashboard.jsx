// import React, { useState, useEffect } from 'react';
// import useMeiliUtils from './MeiliUtils';
// import SetFilters from './SetFilters';
// import CreateCSV from './CreateCSV';
// import { initJuno, listDocs } from '@junobuild/core';
// import Search from './Search';
// import KeyManager from './KeyManager';
// // import useAuth from '../../utils/AuthProvider';
// import MeiliSearchClient from '../../utils/MeiliSearchClient';

// const Dashboard = () => {
//   // const { principal } = useAuth();

//   // if (!principal) {
//   //   return <div>Please log in to access the dashboard.</div>;
//   // }

//   // const { initializeMeiliSearchClient } = MeiliSearchClient(principal);

//   //  New from keymanager.
//   const [selectedSlot, setSelectedSlot] = useState(null);
  
//   const [client, setClient] = useState(null);
//   const [indexes, setIndexes] = useState([]);
//   // const [activeIndex, setActiveIndex] = useState(null);
//   const activeIndex = 'asdf';

//   const [currentView, setCurrentView] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [books, setBooks] = useState([]);

  
//   // if (!principal) {
//   //   return <div>Please log in to access the dashboard.</div>;
//   // }
  
//   // const {
//   //   addBook,
//   //   bookCSV,
//   //   setBookCSV,
//   //   primaryKey,
//   //   tasks,
//   //   filter,
//   //   setFilter,
//   //   createIndex,
//   //   fetchTasks,
//   //   deleteIndex,
//   //   deleteAllDocuments,
//   //   deleteFilteredDocuments,
//   //   generalStats,
//   //   indexStats,
//   //   healthStatus,
//   //   indexSettings,
//   //   filterableAttributes,
//   //   fetchStats,
//   //   fetchIndexSettings,
//   //   fetchFilterableAttributes,
//   //   updateFilters,
//   // } = useMeiliUtils(activeIndex);


//   const allowedFields = ['fiction', 'type', 'subtype', 'pubyear', 'id', 'title', 'author'];

//   // useEffect(() => {
//   //   const fetchKeys = async () => {
//   //     try {
//   //       const { getMeiliSearchKeys } = MeiliSearchClient(principal);
//   //       const fetchedKeys = await getMeiliSearchKeys(principal);
//   //       if (fetchedKeys.length > 0) {
//   //         setSelectedSlot(fetchedKeys[0].slot);
//   //       }
//   //     } catch (error) {
//   //       console.error('Error fetching keys:', error);
//   //     }
//   //   };
    
//   //   fetchKeys();
//   // }, [principal]);
  
//   // useEffect(() => {
//   //   const initializeClient = async () => {
//   //     if (principal) {
//   //       const initializedClient = await initializeMeiliSearchClient(principal);
//   //       setClient(initializedClient);
//   //     }
//   //   };
    
//   //   initializeClient();
//   // }, [principal]);
  

//   // To reintroduce for selecting active Meilisearch Cluster once client initialization in working.
  
//   // const handleClientInitialized = (initializedClient) => {
//   //   console.log("Recieved initialized client: ", initializedClient)
//   //   setClient(initializedClient);
//   // };

//   // useEffect(() => {
//   //     const initializeMeiliSearchClient = async () => {
//   //         if (!selectedSlot) {
//   //             return;
//   //           }

//   //           try {
//   //               const fetchedKeys = await getMeiliSearchKeys(principal);
//   //       const selectedKey = fetchedKeys.find(key => key.slot === selectedSlot);

//   //       if (selectedKey) {
//   //         const client = new MeiliSearch({
//   //           host: selectedKey.meili_domain || 'https://app-uncensoredgreats-dev-001.azurewebsites.net/',
//   //           apiKey: selectedKey.meili_key || '85238b14-cf2f-4066-a822-bd2b4dd18de0',
//   //         });
  
//   //         console.log('Initialized Client 323: ', client);
  
//   //         // Call the handleClientInitialized callback with the initialized client
//   //         handleClientInitialized(client);
//   //       }
//   //     } catch (error) {
//   //       console.error('Error initializing MeiliSearch client:', error);
//   //     }
//   //   };
  
//   //   initializeMeiliSearchClient();
//   // }, [principal, selectedSlot]);

//   // useEffect(() => {
//   //   const fetchIndexes = async () => {
//   //     if (!client) {
//   //       console.error('MeiliSearch client not initialized');
//   //       return;
//   //     }
      
//   //     console.log('Fetching indexes with client:', client);

//   //     try {
//   //       const stats = await client.getStats();
//   //       const indexNames = Object.keys(stats.indexes);
//   //       setIndexes(indexNames);
//   //     } catch (error) {
//   //       console.error('Failed to fetch indexes:', error);
//   //     }
//   //   };

//   //   fetchIndexes();
//   // }, [client, principal]);


// // On hold because of Juno initialization error.

//   // useEffect(() => {
//   //   const fetchBooks = async () => {
//   //     await initJuno({ satelliteId: "kh5oj-myaaa-aaaal-admga-cai" });
//   //     try {
//   //       const bookData = await listDocs({ collection: 'books' });
//   //       setBooks(bookData.items);
//   //     } catch (error) {
//   //       console.error('Error fetching books:', error);
//   //     }
//   //   };
//   //   fetchBooks();
//   // }, []);

//   // const openModal = (index) => {
//   //   setActiveIndex(index);
//   //   setIsModalOpen(true);
//   // };

//   // const closeModal = () => {
//   //   setIsModalOpen(false);
//   // };

//   // const handleConfirm = async (fields) => {
//   //   if (!activeIndex) return;
//   //   console.log(`Updating ${activeIndex} with fields:`, fields);
//   //   await updateFilters(activeIndex, fields);
//   //   closeModal();
//   // };

//   // const handleAddBook = async () => {
//   //   if (!activeIndex) {
//   //     alert('Please select an index to add the book to.');
//   //     return;
//   //   }
//   //   await addBook(bookCSV, activeIndex);
//   // };

//   return (
//     <div>
//       {/* <div style={{ marginBottom: '8px' }}>
//         <button onClick={createIndex} style={{ marginRight: '8px', backgroundColor: 'green' }}>Create New Index</button>
//       </div>

//       <KeyManager principal={principal} />
//       <KeyManager onClientInitialized={handleClientInitialized} />

//       <button onClick={() => fetchTasks()}>Recent Tasks</button>
//       <button onClick={() => fetchStats()}>Cluster Statistics</button>

//       <div>
//         <ul style={{ listStyleType: 'none', padding: 0 }}>
//           {tasks.map((task, index) => (
//             <li key={index} style={{ marginBottom: '8px' }}>
//               Task ID: {task.uid}, Status: {task.status}, type: {task.type}
//             </li>
//           ))}
//         </ul>
//       </div>

//       <div>
//         <h4>Cluster Stats:</h4>
//         <pre>{JSON.stringify(generalStats, null, 2)}</pre>
//       </div>

//       <div style={{ display: 'flex' }}>
//         <div style={{ width: '30%', marginRight: '8px' }}>
//           <h4>Indexes</h4>
//           <ul style={{ listStyleType: 'none', padding: 0 }}>
//             {indexes.map((index) => (
//               <li
//                 key={index}
//                 style={{
//                   backgroundColor: activeIndex === index ? '#ccc' : 'white',
//                   padding: '8px',
//                   marginBottom: '8px',
//                   cursor: 'pointer',
//                 }}
//                 onClick={() => setActiveIndex(index)}
//               >
//                 {index}
//               </li>
//             ))}
//           </ul>
//         </div>

//         <div style={{ width: '70%' }}>
//           {activeIndex && (
//             <div>
//               <h4>Selected Index: {activeIndex}</h4>
//               <div>Primary Key: {primaryKey}</div>

//               <div style={{ marginTop: '8px' }}>
//                 <button onClick={() => deleteIndex(activeIndex)} style={{ marginRight: '8px', backgroundColor: 'red', color: 'white' }}>Delete</button>
//                 <button onClick={() => deleteAllDocuments(activeIndex)} style={{ marginRight: '8px' }}>Delete All Docs</button>
//                 <button onClick={() => { setCurrentView('settings'); fetchIndexSettings(activeIndex); }}>Show Settings</button>
//                 <button onClick={() => { setCurrentView('filters'); fetchFilterableAttributes(activeIndex); }}>Show Available Filters</button>
//                 <button onClick={() => { setCurrentView('stats'); fetchStats(activeIndex); }}>Show Stats</button>
//                 <button onClick={() => openModal(activeIndex)}>Update Filters</button>
//               </div>

//               {currentView === 'settings' && (
//                 <div>
//                   <h4>Index Settings:</h4>
//                   <pre>{JSON.stringify(indexSettings, null, 2)}</pre>
//                 </div>
//               )}

//               {currentView === 'filters' && (
//                 <div>
//                   <h4>Available Filters:</h4>
//                   <ul>
//                     {filterableAttributes.map((attribute, idx) => (
//                       <li key={idx}>{attribute}</li>
//                     ))}
//                   </ul>
//                 </div>
//               )}

//               {currentView === 'stats' && (
//                 <div>
//                   <h4>Index Stats:</h4>
//                   <pre>{JSON.stringify(indexStats, null, 2)}</pre>
//                 </div>
//               )}

//               <SetFilters isOpen={isModalOpen} onClose={closeModal} onConfirm={handleConfirm} allowedFields={allowedFields} />

//               <CreateCSV books={books} onCSVCreated={(csvData) => setBookCSV(csvData)} />
//               <button onClick={handleAddBook} disabled={!activeIndex}>Add Book to Selected Index</button>
//               <Search selectedIndex={activeIndex} />
//             </div>
//           )}
//         </div>
//       </div> */}
//     </div>
//   );
// };

// export default Dashboard;
























// pages/MeiliManager/Dashboard.jsx
import React from 'react';
import useMeiliSearchClient from '../../utils/MeiliSearchClient';
import useMeiliUtils from './MeiliUtils';

const Dashboard = () => {
  // const [activeIndex, setActiveIndex] = useState(null);
  const selectedIndex = 'asdf';
  const { client, loading } = useMeiliSearchClient(selectedIndex);

  const {
    addBook,
    bookCSV,
    setBookCSV,
    primaryKey,
    tasks,
    filter,
    setFilter,
    createIndex,
    fetchTasks,
    deleteIndex,
    deleteAllDocuments,
    deleteFilteredDocuments,
    generalStats,
    indexStats,
    healthStatus,
    indexSettings,
    filterableAttributes,
    fetchStats,
    fetchIndexSettings,
    fetchFilterableAttributes,
    updateFilters,
  } = useMeiliUtils(selectedIndex);

  if (loading) {
    return <p>Loading MeiliSearch client...</p>;
  }
  

  return (
    <div>
      <h1>Test MeiliSearch Client</h1>
      {client ? (
        <p>MeiliSearch client initialized successfully!</p>
      ) : (
        <p>MeiliSearch client not initialized.</p>
      )}
    </div>
  );
};

export default Dashboard;

































// // Way old OG before backend key manager


// import React, { useState, useEffect } from 'react';
// import useMeiliUtils from './MeiliUtils';
// import SetFilters from './SetFilters';
// import CreateCSV from './CreateCSV';
// import { initJuno, listDocs } from '@junobuild/core';
// import Search from './Search';
// // import MeiliSearchClient from '../../utils/MeiliSearchClient';

// const Dashboard = () => {
//   const {
//     addBook,
//     bookCSV,
//     setBookCSV,
//     primaryKey,
//     tasks,
//     filter,
//     setFilter,
//     createIndex,
//     fetchTasks,
//     deleteIndex,
//     deleteAllDocuments,
//     deleteFilteredDocuments,
//     generalStats,
//     indexStats,
//     healthStatus,
//     indexSettings,
//     filterableAttributes,
//     fetchStats,
//     fetchIndexSettings,
//     fetchFilterableAttributes,
//     updateFilters,
//   } = useMeiliUtils();

//   const [indexes, setIndexes] = useState([]);
//   const [activeIndex, setActiveIndex] = useState(null);
//   const [currentView, setCurrentView] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [books, setBooks] = useState([]);
//   const [principal, setPrincipal] = useState('');

//   const allowedFields = ['fiction', 'type', 'subtype', 'pubyear', 'id', 'title', 'author'];

//   // const { saveMeiliSearchKeys, getMeiliSearchKeys } = MeiliSearchClient();

//   // useEffect(() => {
//   //   const fetchIndexes = async () => {
//   //     try {
//   //       const fetchedKeys = await getMeiliSearchKeys();
//   //       setKeys(fetchedKeys);
//   //       const indexNames = fetchedKeys.map((key) => key.meili_domain);
//   //       setIndexes(indexNames);
//   //     } catch (error) {
//   //       console.error('Failed to fetch indexes:', error);
//   //     }
//   //   };
  
//   //   fetchIndexes();
//   // }, [getMeiliSearchKeys]);

//   useEffect(() => {
//     const fetchBooks = async () => {
//       await initJuno({ satelliteId: "kh5oj-myaaa-aaaal-admga-cai" });
//       try {
//         const bookData = await listDocs({ collection: 'books' });
//         setBooks(bookData.items);
//       } catch (error) {
//         console.error('Error fetching books:', error);
//       }
//     };
//     fetchBooks();
//   }, []);

//   const openModal = (index) => {
//     setActiveIndex(index);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//   };

//   const handleConfirm = async (fields) => {
//     if (!activeIndex) return;
//     console.log(`Updating ${activeIndex} with fields:`, fields);
//     await updateFilters(activeIndex, fields);
//     closeModal();
//   };

//   const handleAddBook = async () => {
//     if (!activeIndex) {
//       alert('Please select an index to add the book to.');
//       return;
//     }
//     await addBook(bookCSV, activeIndex);
//   };

//   return (
//     <div>

//       <div style={{ marginBottom: '8px' }}>
//         <button onClick={createIndex} style={{ marginRight: '8px', backgroundColor: 'green' }}>Create New Index</button>
//       </div>

//       <button onClick={() => fetchTasks()}>Recent Tasks</button>
//       <button onClick={() => fetchStats()}>Cluster Statistics</button>

//       <div>
//         <ul style={{ listStyleType: 'none', padding: 0 }}>
//           {tasks.map((task, index) => (
//             <li key={index} style={{ marginBottom: '8px' }}>
//               Task ID: {task.uid}, Status: {task.status}, type: {task.type}
//             </li>
//           ))}
//         </ul>
//       </div>

//       <div>
//         <h4>Cluster Stats:</h4>
//         <pre>{JSON.stringify(generalStats, null, 2)}</pre>
//       </div>

//       <div style={{ display: 'flex' }}>
//         <div style={{ width: '30%', marginRight: '8px' }}>
//           <h4>Indexes</h4>
//           <ul style={{ listStyleType: 'none', padding: 0 }}>
//             {indexes.map((index) => (
//               <li
//                 key={index}
//                 style={{
//                   backgroundColor: activeIndex === index ? '#ccc' : 'white',
//                   padding: '8px',
//                   marginBottom: '8px',
//                   cursor: 'pointer',
//                 }}
//                 onClick={() => setActiveIndex(index)}
//               >
//                 {index}
//               </li>
//             ))}
//           </ul>
//         </div>

//         <div style={{ width: '70%' }}>
//           {activeIndex && (
//             <div>
//               <h4>Selected Index: {activeIndex}</h4>
//               <div>Primary Key: {primaryKey}</div>

//               <div style={{ marginTop: '8px' }}>
//                 <button onClick={() => deleteIndex(activeIndex)} style={{ marginRight: '8px', backgroundColor: 'red', color: 'white' }}>Delete</button>
//                 <button onClick={() => deleteAllDocuments(activeIndex)} style={{ marginRight: '8px' }}>Delete All Docs</button>
//                 <button onClick={() => { setCurrentView('settings'); fetchIndexSettings(activeIndex); }}>Show Settings</button>
//                 <button onClick={() => { setCurrentView('filters'); fetchFilterableAttributes(activeIndex); }}>Show Available Filters</button>
//                 <button onClick={() => { setCurrentView('stats'); fetchStats(activeIndex); }}>Show Stats</button>
//                 <button onClick={() => openModal(activeIndex)}>Update Filters</button>
//               </div>

//               {currentView === 'settings' && (
//                 <div>
//                   <h4>Index Settings:</h4>
//                   <pre>{JSON.stringify(indexSettings, null, 2)}</pre>
//                 </div>
//               )}

//               {currentView === 'filters' && (
//                 <div>
//                   <h4>Available Filters:</h4>
//                   <ul>
//                     {filterableAttributes.map((attribute, idx) => (
//                       <li key={idx}>{attribute}</li>
//                     ))}
//                   </ul>
//                 </div>
//               )}

//               {currentView === 'stats' && (
//                 <div>
//                   <h4>Index Stats:</h4>
//                   <pre>{JSON.stringify(indexStats, null, 2)}</pre>
//                 </div>
//               )}

//               <SetFilters isOpen={isModalOpen} onClose={closeModal} onConfirm={handleConfirm} allowedFields={allowedFields} />

//               <CreateCSV books={books} onCSVCreated={(csvData) => setBookCSV(csvData)} />
//               <button onClick={handleAddBook} disabled={!activeIndex}>Add Book to Selected Index</button>
//               <Search selectedIndex={activeIndex} />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;