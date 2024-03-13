// src/components/KeyManager.jsx
import React, { useState, useEffect } from 'react';
import { saveMeiliSearchKeys, getMeiliSearchKeys, MeiliSearchKeys } from '../../utils/MeiliSearchClient';

const KeyManager = () => {
  const [principal, setPrincipal] = useState('');
  const [meiliDomain, setMeiliDomain] = useState('');
  const [meiliKey, setMeiliKey] = useState('');
  const [slotIndex, setSlotIndex] = useState(0);
  const [keys, setKeys] = useState([]);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const fetchedKeys = await getMeiliSearchKeys(principal);
      setKeys(fetchedKeys);
    } catch (error) {
      console.error('Error fetching keys:', error);
    }
  };

  const handleSaveKeys = async () => {
    try {
      await saveMeiliSearchKeys(principal, meiliDomain, meiliKey, slotIndex);
      fetchKeys();
    } catch (error) {
      console.error('Error saving keys:', error);
    }
  };

  return (
    <div>
      <h2>Key Manager</h2>
      <div>
        <label>Principal:</label>
        <input type="text" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
      </div>
      <div>
        <label>MeiliSearch Domain:</label>
        <input type="text" value={meiliDomain} onChange={(e) => setMeiliDomain(e.target.value)} />
      </div>
      <div>
        <label>MeiliSearch Key:</label>
        <input type="text" value={meiliKey} onChange={(e) => setMeiliKey(e.target.value)} />
      </div>
      <div>
        <label>Slot Index:</label>
        <input type="number" value={slotIndex} onChange={(e) => setSlotIndex(Number(e.target.value))} />
      </div>
      <button onClick={handleSaveKeys}>Save Keys</button>

      <h3>Saved Keys:</h3>
      <ul>
        {keys.map((key, index) => (
          <li key={index}>
            Domain: {key.meili_domain}, Key: {key.meili_key}, Slot: {key.slot}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default KeyManager;

