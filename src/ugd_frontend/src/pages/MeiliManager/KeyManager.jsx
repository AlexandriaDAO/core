// src/components/KeyManager.jsx
import React, { useState, useEffect } from 'react';
import MeiliSearchClient from '../../utils/MeiliSearchClient';
import useAuth from '../../utils/AuthProvider';

const KeyManager = ({ onClientInitialized }) => {
  const { principal } = useAuth();
  const { saveMeiliSearchKeys, getMeiliSearchKeys } = MeiliSearchClient();
  const [meiliDomain, setMeiliDomain] = useState('');
  const [meiliKey, setMeiliKey] = useState('');
  const [slotIndex, setSlotIndex] = useState(0);
  const [keys, setKeys] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const fetchedKeys = await getMeiliSearchKeys(principal);

        console.log("saved keys", fetchedKeys);
        setKeys(fetchedKeys);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching keys:', error);
      }
    };

    if (principal) {
      fetchKeys();
    }
  }, [principal]);

  useEffect(() => {
    if (selectedSlot !== null && !loading) {
      initializeClient(selectedSlot);
    }
  }, [selectedSlot, loading]);

  const handleSaveKeys = async () => {
    try {
      await saveMeiliSearchKeys(principal, meiliDomain, meiliKey, slotIndex);
      await saveMeiliSearchKeys(meiliDomain, meiliKey, slotIndex);
      setKeys(prevKeys => [...prevKeys, { meili_domain: meiliDomain, meili_key: meiliKey, slot: slotIndex }]);
      setMeiliDomain('');
      setMeiliKey('');
      setSlotIndex(0);
    } catch (error) {
      console.error('Error saving keys:', error);
    }
  };

  const handleSlotChange = (slot) => {
    setSelectedSlot(slot);
  };

  const initializeClient = (slot) => {
    const selectedKey = keys.find(key => key.slot === slot);

    if (selectedKey) {
      onClientInitialized(selectedKey.meili_domain, selectedKey.meili_key);
    }
  };

  return (
    <div>
      <h2>Key Manager</h2>
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
            <button onClick={() => handleSlotChange(key.slot)}>Select</button>
          </li>
        ))}
      </ul>
      {selectedSlot !== null && (
        <p>Selected Slot: {selectedSlot}</p>
      )}
    </div>
  );
};

export default KeyManager;