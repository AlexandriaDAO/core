import React, { useState, useEffect } from 'react';
import client from '../../utils/MeiliSearchClient';
import useMeiliUtils from './MeiliUtils';
import SetFilters from './SetFilters';

const Dashboard = () => {
  const {
    indexName,
    setIndexName,
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
  } = useMeiliUtils();

  useEffect(() => {
    const fetchIndexes = async () => {
      try {
        const stats = await client.getStats();
        const indexNames = Object.keys(stats.indexes);
        setIndexes(indexNames);
      } catch (error) {
        console.error('Failed to fetch indexes:', error);
      }
    };

    fetchIndexes();
  }, []);

  const [indexes, setIndexes] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [currentView, setCurrentView] = useState(null);





  // Options for Filter updating.
  const [isModalOpen, setIsModalOpen] = useState(false);

  const allowedFields = ['fiction', 'type', 'subtype', 'pubyear', 'id', 'title', 'author'];

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


  return (
    <div>
      <label style={{ marginBottom: '8px', display: 'block' }}>
        Index Name
        <input
          type="text"
          value={indexName}
          onChange={(event) => setIndexName(event.currentTarget.value)}
          placeholder="Enter index name"
          style={{ display: 'block', margin: '8px 0' }}
        />
      </label>
      <div style={{ marginBottom: '8px' }}>
        <button onClick={createIndex} style={{ marginRight: '8px', backgroundColor: 'green' }}>Create Index</button>
      </div>

      <button onClick={() => fetchTasks()}>Recent Tasks</button>
      <button onClick={() => fetchStats()}>Cluster Statistics</button>

      <div>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {tasks.map((task, index) => (
            <li key={index} style={{ marginBottom: '8px' }}>
              Task ID: {task.uid}, Status: {task.status}, type: {task.type}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4>Cluster Stats:</h4>
          <pre>{JSON.stringify(generalStats, null, 2)}</pre>
      </div>

      {indexes.map((index) => (
        <div key={index} style={{ border: '1px solid #ccc', padding: '8px', marginBottom: '8px' }}>
          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span>{index}</span>
            <span style={{ backgroundColor: healthStatus === 'available' ? 'green' : 'red', color: 'white', padding: '2px 4px' }}>
              {healthStatus}
            </span>
          </div>
          <div>Primary Key: {primaryKey}</div>

          <div style={{ marginTop: '8px' }}>
            <button onClick={() => deleteIndex(index)} style={{ marginRight: '8px', backgroundColor: 'red', color: 'white' }}>Delete</button>
            <button onClick={() => deleteAllDocuments(index)} style={{ marginRight: '8px' }}>Delete All Docs</button>
            <button onClick={() => { setActiveIndex(index); setCurrentView('settings'); fetchIndexSettings(index); }}>Show Settings</button>
            <button onClick={() => { setActiveIndex(index); setCurrentView('filters'); fetchFilterableAttributes(index); }}>Show Available Filters</button>
            <button onClick={() => { setActiveIndex(index); setCurrentView('stats'); fetchStats(index); }}>Show Stats</button>
            <button onClick={() => { setActiveIndex(index); setCurrentView('modal'); openModal(index); }}>Update Filters</button>
          </div>

          {activeIndex === index && currentView === 'settings' && (
            <div>
              <h4>Index Settings:</h4>
              <pre>{JSON.stringify(indexSettings, null, 2)}</pre>
            </div>
          )}

          {activeIndex === index && currentView === 'filters' && (
            <div>
              <h4>Available Filters:</h4>
              <ul>
                {filterableAttributes.map((attribute, idx) => (
                  <li key={idx}>{attribute}</li>
                ))}
              </ul>
            </div>
          )}

          {activeIndex === index && currentView === 'stats' && (
            <div>
              <h4>Index Stats:</h4>
              <pre>{JSON.stringify(indexStats, null, 2)}</pre>
            </div>
          )}

          {activeIndex === index && currentView === 'modal' && (
            <SetFilters isOpen={isModalOpen} onClose={closeModal} onConfirm={handleConfirm} allowedFields={allowedFields} />
          )}

          {/* <button onClick={() => openModal(index)}>Update Filterable Attributes</button> */}
        
        
        </div>
      ))}

      {/* <SetFilters isOpen={isModalOpen} onClose={closeModal} onConfirm={handleConfirm} allowedFields={allowedFields} /> */}

    </div>
  );
};

export default Dashboard;


