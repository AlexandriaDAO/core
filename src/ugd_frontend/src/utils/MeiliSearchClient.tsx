// // src/utils/MeiliSearchClient.tsx
// import { MeiliSearch } from 'meilisearch';

// const client = new MeiliSearch({
//   host: process.env.MEILI_DOMAIN || 'https://app-uncensoredgreats-dev-001.azurewebsites.net/',
//   apiKey: process.env.MEILI_MASTER_KEY || '85238b14-cf2f-4066-a822-bd2b4dd18de0',
// });

// export default client;









// src/utils/MeiliSearchClient.tsx

import { ugd_backend } from '../../../declarations/ugd_backend';

export const saveMeiliSearchKeys = async (
  principal: string,
  meiliDomain: string,
  meiliKey: string,
  slotIndex: number
): Promise<void> => {
  try {
    const result = await ugd_backend.save_meilisearch_keys(principal, meiliDomain, meiliKey, slotIndex);
    if ('Ok' in result) {
      // Keys saved successfully
    } else {
      // Error saving keys
      console.error('Error saving MeiliSearch keys:', result.Err);
      throw new Error(result.Err);
    }
  } catch (error) {
    console.error('Error saving MeiliSearch keys:', error);
    throw error;
  }
};

export const getMeiliSearchKeys = async (principal: string): Promise<MeiliSearchKeys[]> => {
  try {
    const keys = await ugd_backend.get_meilisearch_keys(principal);
    return keys;
  } catch (error) {
    console.error('Error getting MeiliSearch keys:', error);
    throw error;
  }
};

export interface MeiliSearchKeys {
  meili_domain: string;
  meili_key: string;
  slot: number;
}