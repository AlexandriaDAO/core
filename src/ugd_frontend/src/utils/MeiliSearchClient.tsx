// // src/utils/MeiliSearchClient.tsx
// import { MeiliSearch } from 'meilisearch';
// import { ugd_backend } from '../../../declarations/ugd_backend';

// const client = new MeiliSearch({
//   host: process.env.MEILI_DOMAIN || 'https://app-uncensoredgreats-dev-001.azurewebsites.net/',
//   apiKey: process.env.MEILI_MASTER_KEY || '85238b14-cf2f-4066-a822-bd2b4dd18de0',
// });

// export default client;


















// // src/utils/MeiliSearchClient.tsx
// import { ugd_backend } from '../../../declarations/ugd_backend';
// import useAuth from './AuthProvider';

// const MeiliSearchClient = () => {
//   const { principal } = useAuth();

//   const saveMeiliSearchKeys = async (
//     meiliDomain: string,
//     meiliKey: string,
//     slotIndex: number
//   ): Promise<void> => {
//     if (!principal) {
//       console.error('User not authenticated');
//       return;
//     }

//     try {
//       const result = await ugd_backend.save_meilisearch_keys(
//         principal as string,
//         meiliDomain,
//         meiliKey,
//         slotIndex
//       );

//       if ('Ok' in result) {
//         console.log('MeiliSearch keys saved successfully');
//       } else {
//         console.error('Error saving MeiliSearch keys:', result.Err);
//       }
//     } catch (error) {
//       console.error('Error saving MeiliSearch keys:', error);
//     }
//   };

//   const getMeiliSearchKeys = async (): Promise<MeiliSearchKeys[]> => {
//     if (!principal) {
//       console.error('User not authenticated');
//       return [];
//     }

//     try {
//       const userKeys = await ugd_backend.get_meilisearch_keys(principal as string);
//       console.log('MeiliSearch keys retrieved successfully');
//       return userKeys;
//     } catch (error) {
//       console.error('Error retrieving MeiliSearch keys:', error);
//       return [];
//     }
//   };

//   return {
//     saveMeiliSearchKeys,
//     getMeiliSearchKeys,
//   };
// };

// export interface MeiliSearchKeys {
//   meili_domain: string;
//   meili_key: string;
//   slot: number;
// }

// export default MeiliSearchClient;










// // src/utils/MeiliSearchClient.tsx
// import { ugd_backend } from '../../../declarations/ugd_backend';
// import useAuth from './AuthProvider';

/*
Backend functions:
- save_meilisearch_keys(principal_text: String, meili_domain: String, meili_key: String, slot_index: u8) -> Result<(), String>
  - Saves MeiliSearch keys for a user based on their principal.
  - Returns Ok(()) on success or Err(String) on failure.

- get_meilisearch_keys(principal_text: String) -> Vec<MeiliSearchKeys>
  - Retrieves MeiliSearch keys for a user based on their principal.
  - Returns a vector of MeiliSearchKeys.
*/

// const MeiliSearchClient = () => {
//   const { principal } = useAuth();

//   const saveMeiliSearchKeys = async (
//     meiliDomain: string,
//     meiliKey: string,
//     slotIndex: number
//   ): Promise<void> => {
//     if (!principal) {
//       console.error('User not authenticated');
//       return;
//     }

//     try {
//       const result = await ugd_backend.save_meilisearch_keys(
//         (principal as any).toString(),
//         meiliDomain,
//         meiliKey,
//         Number(slotIndex)
//       );

//       if ('Ok' in result) {
//         console.log('MeiliSearch keys saved successfully');
//       } else {
//         console.error('Error saving MeiliSearch keys:', result.Err);
//       }
//     } catch (error) {
//       console.error('Error saving MeiliSearch keys:', error);
//     }
//   };

//   const getMeiliSearchKeys = async (): Promise<MeiliSearchKeys[]> => {
//     console.log('getMeiliSearchKeys called');
//     console.log('principal:', principal);
//     if (!principal) {
//       console.error('User not authenticated');
//       return [];
//     }

//     try {
//       const userKeys = await ugd_backend.get_meilisearch_keys((principal as any).toString());
//       console.log('MeiliSearch keys retrieved successfully');
//       return userKeys;
//     } catch (error) {
//       console.error('Error retrieving MeiliSearch keys:', error);
//       return [];
//     }
//   };

//   return {
//     saveMeiliSearchKeys,
//     getMeiliSearchKeys,
//   };
// };

// export interface MeiliSearchKeys {
//   meili_domain: string;
//   meili_key: string;
//   slot: number;
// }

// export default MeiliSearchClient;







// src/utils/MeiliSearchClient.tsx
import { MeiliSearch } from 'meilisearch';
import { ugd_backend } from '../../../declarations/ugd_backend';

const MeiliSearchClient = () => {
  const saveMeiliSearchKeys = async (
    principal: any,
    meiliDomain: string,
    meiliKey: string,
    slotIndex: number
  ): Promise<void> => {
    if (!principal) {
      console.error('User not authenticated');
      return;
    }
    try {
      const result = await ugd_backend.save_meilisearch_keys(
        principal.toString(),
        meiliDomain,
        meiliKey,
        Number(slotIndex)
      );
      if ('Ok' in result) {
        console.log('MeiliSearch keys saved successfully');
      } else {
        console.error('Error saving MeiliSearch keys:', result.Err);
      }
    } catch (error) {
      console.error('Error saving MeiliSearch keys:', error);
    }
  };

  const getMeiliSearchKeys = async (principal: any): Promise<MeiliSearchKeys[]> => {
    console.log('getMeiliSearchKeys called');
    console.log('principal:', principal);
    if (!principal) {
      console.error('User not authenticated');
      return [];
    }
    try {
      const userKeys = await ugd_backend.get_meilisearch_keys(principal.toString());
      console.log('MeiliSearch keys retrieved successfully');
      return userKeys;
    } catch (error) {
      console.error('Error retrieving MeiliSearch keys:', error);
      return [];
    }
  };

  const initializeMeiliSearchClient = (meiliDomain: string, meiliKey: string): MeiliSearch => {
    const client = new MeiliSearch({
      host: meiliDomain,
      apiKey: meiliKey,
    });
    return client;
  };

  return {
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

export default MeiliSearchClient;