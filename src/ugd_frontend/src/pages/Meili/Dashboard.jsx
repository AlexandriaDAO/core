// pages/MeiliManager/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import useMeiliSearchClient from '../../utils/MeiliSearchClient';
import { useAuth } from '@/contexts/AuthContext';
import useMeiliUtils from './MeiliUtils';
import SetFilters from './SetFilters';
import CreateCSV from './CreateCSV';
import { listDocs,initJuno } from '@junobuild/core';
import Search from './Search';

const Dashboard = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const { UID } = useAuth();
  const selectedIndex = ''; // There's probably a better way to do this but it allows us to reset things when activeIndex changes.
  const { indexes, client } = useMeiliSearchClient();
  const [currentView, setCurrentView] = useState(null);
  const [books, setBooks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const allowedFields = ['fiction', 'type', 'subtype', 'pubyear', 'id', 'title', 'author'];
  const [indexName, setIndexName] = useState('');

  const {
    addBook,
    addBookJSON,
    bookCSV,
    setBookCSV,
    bookJSON,
    setBookJSON,
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

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        await initJuno({ satelliteId: "kh5oj-myaaa-aaaal-admga-cai" });
        const bookData = await listDocs({ collection: 'books' });
        setBooks(bookData.items);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };
    fetchBooks();
  }, []);

  const openModal = (index) => {
    setActiveIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirm = async (fields) => {
    if (!activeIndex) return;

    console.log(`Updating ${activeIndex} with fields:`, fields);
    await updateFilters(activeIndex, fields);
    closeModal();
  };

  const handleAddBookAsCSV = async () => {
    if (!activeIndex) {
      alert('Please select an index to add the book to.');
      return;
    }
    if (!bookCSV) {
      alert('bookCSV empty.');
      return;
    }
    addBook(bookCSV, activeIndex);
  };

  const handleAddBookAsJSON = async () => {
    if (!activeIndex) {
      alert('Please select an index to add the book to.');
      return;
    }
    if (!bookJSON) {
      alert('bookJSON empty.');
      return;
    }
    addBookJSON(bookJSON, activeIndex);
  };


  const handleAddIndex = async()=>{
    if (indexName.length <=0 ) {
      alert('Index Name is required.');
      return;
    }
    createIndex(indexName)
  }
  
  if ([null, '2vxsx-fae'].includes(UID)) {
    return <p>Log in to access the dashboard.</p>;
  }

  
  return (
    <div className='p-10 font-roboto-condensed text-base flex flex-col md:flex-row gap-2'>
      <div className='flex flex-col gap-4 w-1/2 md:w-full'>
        <div className='flex flex-col items-start gap-2'>
          <span className='font-bold text-lg'>Create Index</span>
          <div className='flex items-center justify-start gap-1'>
            <input
              id='create-index'
              type="text"
              value={indexName}
              onChange={(e) => setIndexName(e.target.value)}
              placeholder="Enter index name"
            />
            <button onClick={handleAddIndex} className='bg-green-400 text-black hover:bg-green-300 px-2 transition-all duration-300 rounded'>
              Create New Index
            </button>
          </div>
        </div>

        {/* <KeyManager onClientInitialized={(e)=>console.log('in',e)} /> */}

        <div className='flex flex-col items-start gap-2'>
          <span className='font-bold text-lg'>Recent Tasks</span>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {tasks.map((task, index) => (
              <li key={index} style={{ marginBottom: '8px' }}>
                Task ID: {task.uid}, Status: {task.status}, type: {task.type}
              </li>
            ))}
          </ul>
          <button onClick={() => fetchTasks()} className='bg-green-400 text-black hover:bg-green-300 px-2 transition-all duration-300 rounded'>Fetch Tasks</button>
        </div>

        <div className='flex flex-col items-start gap-2'>
          <span className='font-bold text-lg'>Cluster Statistics</span>
          <pre>{JSON.stringify(generalStats, null, 2)}</pre>
          <button onClick={() => fetchStats()} className='bg-green-400 text-black hover:bg-green-300 px-2 transition-all duration-300 rounded'>Fetch Stats</button>
        </div>

      </div>
      <div className='flex flex-col gap-4 w-1/2 md:w-full'>
        <div className='flex flex-col'>
          <span className='font-bold text-lg'>Initialized Client</span>
          {client ? <div className='flex flex-col gap-1'>
            <div className='flex gap-1'>
              <span className='font-bold'>Host</span>
              <span>{client?.config?.host}</span>
            </div>
            <div className='flex gap-1'>
              <span className='font-bold'>Key</span>
              <span>{client?.config?.apiKey}</span>
            </div>
          </div> : <div>No Client Initialized, Check Your keys.</div> }
        </div>
        <div className='flex flex-col'>
          <span className='font-bold text-lg'>Indexes List</span>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {indexes.map((index) => (
              <li
                key={index}
                style={{
                  backgroundColor: activeIndex === index ? '#ccc' : 'white',
                  padding: '8px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => setActiveIndex(index)}
              >
                {index}
              </li>
            ))}
          </ul>
        </div>

        <div>
          {activeIndex && (
            <div className='flex flex-col items-start justify-between gap-2'>
              <div className='flex items-center gap-2'>
                <span className='font-semibold text-lg'>Selected Index:</span>
                <span>{activeIndex}</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='font-semibold text-lg'>Primary Key:</span>
                <span>{primaryKey}</span>
              </div>
              <div>
                <span className='font-semibold text-lg'>Index Actions</span>
                <div className='flex flex-wrap gap-2'>
                  <button className='bg-green-400 text-black hover:bg-green-300 px-2 transition-all duration-300 rounded' onClick={() => deleteIndex(activeIndex)} >Delete</button>
                  <button className='bg-green-400 text-black hover:bg-green-300 px-2 transition-all duration-300 rounded' onClick={() => deleteAllDocuments(activeIndex)} >Delete All Docs</button>
                  <button className='bg-green-400 text-black hover:bg-green-300 px-2 transition-all duration-300 rounded' onClick={() => { setCurrentView('settings'); fetchIndexSettings(activeIndex); }}>Show Settings</button>
                  <button className='bg-green-400 text-black hover:bg-green-300 px-2 transition-all duration-300 rounded' onClick={() => { setCurrentView('filters'); fetchFilterableAttributes(activeIndex); }}>Show Available Filters</button>
                  <button className='bg-green-400 text-black hover:bg-green-300 px-2 transition-all duration-300 rounded' onClick={() => { setCurrentView('stats'); fetchStats(activeIndex); }}>Show Stats</button>
                  <button className='bg-green-400 text-black hover:bg-green-300 px-2 transition-all duration-300 rounded' onClick={() => openModal(activeIndex)}>Update Filters</button>
                </div>
              </div>


              {currentView === 'settings' && (
                <div>
                  <span className='font-semibold text-lg'>Index Settings:</span>
                  <pre>{JSON.stringify(indexSettings, null, 2)}</pre>
                </div>
              )}

              {currentView === 'filters' && (
                <div>
                  <span className='font-semibold text-lg'>Available Filters</span>
                  <ul>
                    {filterableAttributes.map((attribute, idx) => (
                      <li key={idx}>{attribute}</li>
                    ))}
                  </ul>
                </div>
              )}

              {currentView === 'stats' && (
                <div>
                  <span className='font-semibold text-lg'>Index Stats</span>
                  <pre>{JSON.stringify(indexStats, null, 2)}</pre>
                </div>
              )}

              <SetFilters isOpen={isModalOpen} onClose={closeModal} onConfirm={handleConfirm} allowedFields={allowedFields} />
              <CreateCSV books={books} onCSVCreated={(csvData) => setBookCSV(csvData)} onJSONCreated={(jsonData) => setBookJSON(jsonData)} />
              <button onClick={handleAddBookAsCSV} disabled={!activeIndex || !bookCSV} className={`${!activeIndex || !bookCSV ? 'bg-green-200 border-green-500 border': 'bg-green-400 hover:bg-green-300'} text-black  px-2 transition-all duration-300 rounded`}>Add Book's CSV to Selected Index</button>
              <button onClick={handleAddBookAsJSON} disabled={!activeIndex || !bookJSON} className={`${!activeIndex || !bookJSON ? 'bg-green-200 border-green-500 border': 'bg-green-400 hover:bg-green-300'} text-black  px-2 transition-all duration-300 rounded`}>Add Book's JSON to Selected Index</button>

              <Search selectedIndex={activeIndex} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;













