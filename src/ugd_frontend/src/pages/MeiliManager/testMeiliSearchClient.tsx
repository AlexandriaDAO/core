// src/components/TestMeiliSearchClient.tsx
import React, { useEffect, useState } from 'react';
import { MeiliSearch } from 'meilisearch';
import MeiliSearchClient from '../../utils/MeiliSearchClient';

const TestMeiliSearchClient: React.FC = () => {
  const [client, setClient] = useState<MeiliSearch | null>(null);
  const { initializeMeiliSearchClient } = MeiliSearchClient();

  useEffect(() => {
    const testMeiliSearchClient = async () => {
      const initializedClient = await initializeMeiliSearchClient();
      setClient(initializedClient);
    };

    testMeiliSearchClient();
  }, [initializeMeiliSearchClient]);

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

export default TestMeiliSearchClient;