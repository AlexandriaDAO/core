import React, { useEffect, useState } from 'react';
import useMeiliSearchClient from '../../utils/MeiliSearchClient';
import Papa from 'papaparse'


const useMeiliUtils = (selectedIndex) => {
  const { client, loading } = useMeiliSearchClient();
  const [indexName, setIndexName] = useState('');
  const [bookCSV, setBookCSV] = useState('');
  const [bookJSON, setBookJSON] = useState('');
  const [primaryKey, setPrimaryKey] = useState('id');
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('');
  const [generalStats, setGeneralStats] = useState({});
  const [indexStats, setIndexStats] = useState({});
  const [healthStatus, setHealthStatus] = useState('checking'); // 'checking', 'available', 'unavailable'
  const [indexSettings, setIndexSettings] = useState({});
  const [filterableAttributes, setFilterableAttributes] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);


  // This is failing right now and I don't know why. I think it works on azure and not meilisearch because of a serialization issue but not totally sure.
  const createIndex = async (indexName) => {
    try {
      await client.createIndex(indexName, { primaryKey: primaryKey });
      alert('Index created successfully');
      fetchTasks();
      setIndexName('');
    } catch (error) {
      console.log("Existing client stats: ", await client.getStats())
      alert('Failed to create index');
      console.error('Error creating index:', error);
    }
  };

  const addBook = (file, indexName) => {
    Papa.parse(file, {
      complete: function(results) {
        const documents = results.data;
        client.index(indexName).addDocuments(documents)
          .then(() => {
            alert('Book added successfully');
            fetchTasks();
          })
          .catch((error) => {
            console.error('Failed to add book:', error);
            alert('Failed to add book');
          });
      },
      header: true
    });
  }

  const addBookJSON = (file, indexName) => {
    client.index(indexName).addDocuments(file)
      .then(() => {
        alert('Book added successfully');
        fetchTasks();
      })
      .catch((error) => {
        console.error('Failed to add book:', error);
        alert('Failed to add book');
      });
  }

  const fetchTasks = async () => {
    try {
      const tasksResponse = await client.getTasks();
      setTasks(tasksResponse.results);
    } catch (error) {
      alert('Failed to fetch tasks');
    }
  };

  const deleteIndex = async (index) => {
    try {
      await client.deleteIndex(index);
      alert('Index deleted successfully');
      fetchTasks();
    } catch (error) {
      alert('Failed to delete index');
    }
  };

  const deleteAllDocuments = async (index) => {
    try {
      await client.index(index).deleteAllDocuments();
      alert('All documents deleted successfully');
      fetchTasks();
    } catch (error) {
      alert('Failed to delete documents');
    }
  };

  {/*To Be determined in advanced version later.*/}
  const deleteFilteredDocuments = async () => {
    try {
      await client.index(indexName).deleteDocuments({ filter: filter });
      alert('Filtered documents deleted successfully');
      fetchTasks();
    } catch (error) {
      alert('Failed to delete filtered documents');
    }
  };

  const fetchHealthStatus = async () => {
    try {
      const health = await client.health();
      setHealthStatus(health.status === 'available' ? 'available' : 'unavailable');
    } catch (error) {
      setHealthStatus('unavailable');
    }
  };

  const fetchStats = async (index) => {
    console.log("FetchStats has been Called!")
    console.log("Client right now", client)
    console.log("loading right now", loading)
    if (loading) return;
    if (index) {
      const indexStats = await client.index(index).getStats();
      setIndexStats({ [index]: indexStats });
    } else {
      const generalStats = await client.getStats();
      setGeneralStats(generalStats);
    }
  };

  const fetchIndexSettings = async (index) => {
    if (loading) return;
    const settings = await client.index(index).getSettings();
    setIndexSettings(settings);
  };

  const fetchFilterableAttributes = async (index) => {
    if (loading) return;
    const attributes = await client.index(index).getFilterableAttributes();
    setFilterableAttributes(attributes);
  };

  const updateFilters = async (index, fields = ['fiction', 'type', 'subtype', 'pubyear', 'id', 'title', 'author']) => {
    // Ensure only allowed fields are updated
    const allowedFields = ['fiction', 'type', 'subtype', 'pubyear', 'id', 'title', 'author'];
    const filteredFields = fields.filter(field => allowedFields.includes(field));
  
    await client.index(index).updateFilterableAttributes(filteredFields);
    fetchFilterableAttributes(index);
  };

  useEffect(() => {
    fetchHealthStatus();
    if (selectedIndex) {
      fetchStats();
      fetchIndexSettings();
      fetchFilterableAttributes();
    }
  }, [selectedIndex]);


  return {
    indexName,
    setIndexName,
    addBook,
    addBookJSON,
    bookCSV,
    setBookCSV,
    bookJSON,
    setBookJSON,
    primaryKey,
    setPrimaryKey,
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
    fetchHealthStatus,
    fetchStats,
    fetchIndexSettings,
    fetchFilterableAttributes,
    updateFilters,
  };
};

export default useMeiliUtils;














