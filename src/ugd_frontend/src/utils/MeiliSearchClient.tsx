// src/utils/MeiliSearchClient.tsx
import { useState, useEffect } from 'react';
import { MeiliSearch } from 'meilisearch';
import { ugd_backend } from '../../../declarations/ugd_backend';
import { useAuth } from './../contexts/AuthContext'
import { AiOutlineConsoleSql } from 'react-icons/ai';
import { Principal } from '@dfinity/principal';

interface MeiliSearchClientHook {
  client: any;
  loading: any;
  indexes: any;
  saveMeiliSearchKeys: (
    meiliDomain: string,
    meiliKey: string,
    slotIndex: number
  ) => Promise<boolean>;
  getMeiliSearchKeys: () => Promise<MeiliSearchKeys[]>;
  initializeMeiliSearchClient: () => Promise<MeiliSearch | null>;
}

const useMeiliSearchClient = (): MeiliSearchClientHook => {
  const { UID } = useAuth();
  const UIDText = UID ? (UID as Principal).toText() : null;
  const [client, setClient] = useState<MeiliSearch | null>(null);
  const [loading, setLoading] = useState(true);
  const [indexes, setIndexes] = useState<string[]>([]);
  
  useEffect(() => {
    const initializeClient = async () => {
      if (!([null, '2vxsx-fae'].includes(UIDText))) {
        setLoading(true);
        const initializedClient = await initializeMeiliSearchClient();
        setClient(initializedClient);
        setLoading(false);
      }
    };

    initializeClient();
  }, [UID]);

  useEffect(() => {
    const fetchIndexes = async () => {
      if (!client) {
        console.error('MeiliSearch client not initialized');
        return;
      }
      try {
        const stats = await client.getStats();
        const indexNames = Object.keys(stats.indexes);
        setIndexes(indexNames);
      } catch (error) {
        console.error('Failed to fetch indexes:', error);
      }
    };
    
    fetchIndexes();
  }, [client]);

  const saveMeiliSearchKeys = async (
    meiliDomain: string,
    meiliKey: string,
    slotIndex: number
  ): Promise<boolean> => {
    if ([null, '2vxsx-fae'].includes(UIDText)) {
      alert('Login to save keys')
      console.error('User not authenticated');
      return false;
    }

    try {
      const result = await ugd_backend.save_meilisearch_keys(
        meiliDomain,
        meiliKey,
        Number(slotIndex)
      );
      if ('Ok' in result) {
        console.log('MeiliSearch keys saved successfully');
        return true;
      } else {
        console.error('Error saving MeiliSearch keys:', result.Err);
      }
    } catch (error) {
      console.error('Error saving MeiliSearch keys:', error);
    }
    return false;
  };

  const getMeiliSearchKeys = async () => {
    console.log('getMeiliSearchKeys called');
    if ([null, '2vxsx-fae'].includes(UIDText)) {
      console.error('User not authenticated');
      return [];
    }
    try {
      const userKeys = await ugd_backend.get_meilisearch_keys();
      console.log('MeiliSearch keys retrieved successfully');
      return userKeys;
    } catch (error) {
      console.error('Error retrieving MeiliSearch keys:', error);
      return [];
    }
  };

  const initializeMeiliSearchClient = async (): Promise<MeiliSearch | null> => {
    if ([null, '2vxsx-fae'].includes(UIDText)) {
      console.error('User not authenticated');
      return null;
    }

    try {
      const userKeys = await getMeiliSearchKeys();
      if (userKeys.length > 0) {
        const { meili_domain, meili_key } = userKeys[0];
        const client = new MeiliSearch({
          host: meili_domain,
          apiKey: meili_key,
        });

        // Test the client connection
        try {
          await client.health();
          console.log('MeiliSearch client initialized successfully');
          return client;
        } catch (error) {
          console.error('Error testing MeiliSearch client connection:', error);
        }
      }
    } catch (error) {
      console.error('Error initializing MeiliSearch client:', error);
    }
    return null;
  };

  return {
    client,
    loading,
    indexes,
    saveMeiliSearchKeys,
    getMeiliSearchKeys,
    initializeMeiliSearchClient,
  };
};

export interface MeiliSearchKeys {
  meili_domain: string;
  meili_key: string;
  slot: number;
}

export default useMeiliSearchClient;