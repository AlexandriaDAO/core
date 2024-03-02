
import React, { useEffect, useState } from 'react';
import client from '../../utils/MeiliSearchClient';
import { FaCircle } from 'react-icons/fa';

const Stats = ({ selectedIndex }) => {
  const [generalStats, setGeneralStats] = useState({});
  const [indexStats, setIndexStats] = useState({});
  const [healthStatus, setHealthStatus] = useState('checking'); // 'checking', 'available', 'unavailable'

  const fetchHealthStatus = async () => {
    try {
      const health = await client.health();
      if (health.status === 'available') {
        setHealthStatus('available');
      } else {
        setHealthStatus('unavailable');
      }
    } catch (error) {
      setHealthStatus('unavailable');
    }
  };

  const fetchStats = async () => {
    const generalStatsResponse = await client.getStats();
    setGeneralStats(generalStatsResponse);

    const indexStatsResponse = await client.index(selectedIndex).getStats();
    setIndexStats({ [selectedIndex]: indexStatsResponse });
  };

  useEffect(() => {
    fetchStats();
    fetchHealthStatus();
  }, [selectedIndex]);

  const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '10px',
    margin: '10px 0',
    backgroundColor: '#f9f9f9',
  };

  return (
    <div>
      <button onClick={fetchStats} style={{ margin: '10px 0', padding: '5px 10px' }}>Refresh Database Status</button>
      <div>
        <h3>Database Health:</h3>
        {healthStatus === 'available' ? (
          <p><FaCircle color="green" /> Running</p>
        ) : healthStatus === 'unavailable' ? (
          <p><FaCircle color="red" /> DB Down</p>
        ) : (
          <p>Checking...</p>
        )}
      </div>
      <div style={cardStyle}>
        <h3>General Stats:</h3>
        <p>Database Size: {generalStats.databaseSize}</p>
        <p>Last Update: {generalStats.lastUpdate}</p>
      </div>
      <div style={cardStyle}>
        <h3>Stats for Selected Index ({selectedIndex}):</h3>
        {indexStats[selectedIndex] && (
          <div>
            <p>Number of Documents: {indexStats[selectedIndex].numberOfDocuments}</p>
            <p>Is Indexing: {indexStats[selectedIndex].isIndexing ? 'Yes' : 'No'}</p>
            <div>
              <strong>Field Distribution:</strong>
              <ul>
                {Object.entries(indexStats[selectedIndex].fieldDistribution).map(([field, count]) => (
                  <li key={field}>{`${field}: ${count}`}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;
