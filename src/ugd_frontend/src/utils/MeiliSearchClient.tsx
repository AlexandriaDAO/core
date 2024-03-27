// // src/utils/MeiliSearchClient.tsx
// import { MeiliSearch } from 'meilisearch';
// // import { ugd_backend } from '../../../declarations/ugd_backend';

// const client = new MeiliSearch({
//   // host: process.env.MEILI_DOMAIN || 'https://app-uncensoredgreats-dev-001.azurewebsites.net/',
//   // apiKey: process.env.MEILI_MASTER_KEY || '85238b14-cf2f-4066-a822-bd2b4dd18de0',
//   host: process.env.MEILI_DOMAIN || 'https://ms-9606e34cb50c-8283.nyc.meilisearch.io',
//   apiKey: process.env.MEILI_MASTER_KEY || 'f107a5bdfacc252e0ed61f67bc5b08ac7c007c6c',
// });

// export default client;


// // src/utils/MeiliSearchClient.tsx
// import { useState, useEffect } from 'react';
// import { MeiliSearch } from 'meilisearch';
// import { ugd_backend } from '../../../declarations/ugd_backend';
// import useAuth from './AuthProvider';


// interface MeiliSearchClientHook {
//   client: any;
//   loading: any;
//   saveMeiliSearchKeys: (
//     meiliDomain: string,
//     meiliKey: string,
//     slotIndex: number
//   ) => Promise<boolean>;
//   getMeiliSearchKeys: (principal: any) => Promise<MeiliSearchKeys[]>;
//   initializeMeiliSearchClient: () => Promise<MeiliSearch | null>;
// }

// const useMeiliSearchClient = (): MeiliSearchClientHook => {
//   const { principal } = useAuth();
//   const [client, setClient] = useState<MeiliSearch | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const initializeClient = async () => {
//       if (principal) {
//         setLoading(true);
//         const initializedClient = await initializeMeiliSearchClient();
//         setClient(initializedClient);
//         setLoading(false);
//       }
//     };

//     initializeClient();
//   }, [principal]);



//   const saveMeiliSearchKeys = async (
//     meiliDomain: string,
//     meiliKey: string,
//     slotIndex: number
//   ): Promise<boolean> => {
//     if (!principal) {
//       alert('Login to save keys')
//       console.error('User not authenticated');
//       return false;
//     }

//     try {
//       const result = await ugd_backend.save_meilisearch_keys(
//         principal,
//         meiliDomain,
//         meiliKey,
//         Number(slotIndex)
//       );
//       if ('Ok' in result) {
//         console.log('MeiliSearch keys saved successfully');
//         return true;
//       } else {
//         console.error('Error saving MeiliSearch keys:', result.Err);
//       }
//     } catch (error) {
//       console.error('Error saving MeiliSearch keys:', error);
//     }
//     return false;
//   };

//   const getMeiliSearchKeys = async (principal: any): Promise<MeiliSearchKeys[]> => {
//     console.log('getMeiliSearchKeys called');
//     console.log('principal:', principal);
//     if (!principal) {
//       console.error('User not authenticated');
//       return [];
//     }
//     try {
//       const userKeys = await ugd_backend.get_meilisearch_keys(principal.toString());
//       const cdk_caller = await ugd_backend.cdk_caller();
//       console.log("cdk_caller: ", cdk_caller)
//       console.log('MeiliSearch keys retrieved successfully');
//       return userKeys;
//     } catch (error) {
//       console.error('Error retrieving MeiliSearch keys:', error);
//       return [];
//     }
//   };

//   const initializeMeiliSearchClient = async (): Promise<MeiliSearch | null> => {
//     if (!principal) {
//       console.error('User not authenticated');
//       return null;
//     }

//     try {
//       const userKeys = await getMeiliSearchKeys(principal);
//       if (userKeys.length > 0) {
//         const { meili_domain, meili_key } = userKeys[0];
//         console.log('MeiliSearch Domain:', meili_domain);
//         console.log('MeiliSearch Key:', meili_key);

//         const client = new MeiliSearch({
//           host: meili_domain,
//           apiKey: meili_key,
//         });

//         // Test the client connection
//         try {
//           await client.health();
//           console.log('MeiliSearch client initialized successfully');
//           return client;
//         } catch (error) {
//           console.error('Error testing MeiliSearch client connection:', error);
//         }
//       }
//     } catch (error) {
//       console.error('Error initializing MeiliSearch client:', error);
//     }
//     return null;
//   };

//   return {
//     client,
//     loading,
//     saveMeiliSearchKeys,
//     getMeiliSearchKeys,
//     initializeMeiliSearchClient,
//   };
// };

// export interface MeiliSearchKeys {
//   meili_domain: string;
//   meili_key: string;
//   slot: number;
// }

// export default useMeiliSearchClient;












// // // FOR SOME WEIRD REASON, THIS UID REFUSES TO UPDATE SO I'M JUST GOING TO DO IT IN THE BACKEND.

// // src/utils/MeiliSearchClient.tsx
// import { useState, useEffect } from 'react';
// import { MeiliSearch } from 'meilisearch';
// import { ugd_backend } from '../../../declarations/ugd_backend';
// import { useAuth } from './AuthProvider';
// import { AiOutlineConsoleSql } from 'react-icons/ai';


// interface MeiliSearchClientHook {
//   client: any;
//   loading: any;
//   saveMeiliSearchKeys: (
//     meiliDomain: string,
//     meiliKey: string,
//     slotIndex: number
//   ) => Promise<boolean>;
//   getMeiliSearchKeys: (principal: any) => Promise<MeiliSearchKeys[]>;
//   initializeMeiliSearchClient: () => Promise<MeiliSearch | null>;
// }

// const useMeiliSearchClient = (): MeiliSearchClientHook => {
//   const { UID } = useAuth();
//   const [client, setClient] = useState<MeiliSearch | null>(null);
//   const [loading, setLoading] = useState(true);
  
//   useEffect(() => {
//     const initializeClient = async () => {
//       console.log("initialize client called!")
//       console.log("UID at initialized client is: ", UID)
//       if (UID) {
//         setLoading(true);
//         const initializedClient = await initializeMeiliSearchClient();
//         setClient(initializedClient);
//         setLoading(false);
//       }
//     };

//     initializeClient();
//   }, [UID]);



//   const saveMeiliSearchKeys = async (
//     meiliDomain: string,
//     meiliKey: string,
//     slotIndex: number
//   ): Promise<boolean> => {
//     if (!UID) {
//       alert('Login to save keys')
//       console.error('User not authenticated');
//       return false;
//     }

//     try {
//       const result = await ugd_backend.save_meilisearch_keys(
//         UID,
//         meiliDomain,
//         meiliKey,
//         Number(slotIndex)
//       );
//       if ('Ok' in result) {
//         console.log('MeiliSearch keys saved successfully');
//         return true;
//       } else {
//         console.error('Error saving MeiliSearch keys:', result.Err);
//       }
//     } catch (error) {
//       console.error('Error saving MeiliSearch keys:', error);
//     }
//     return false;
//   };

//   const getMeiliSearchKeys = async (UID: any): Promise<MeiliSearchKeys[]> => {
//     console.log('getMeiliSearchKeys called');
//     console.log('principal:', UID);
//     if (!UID) {
//       console.error('User not authenticated');
//       return [];
//     }
//     try {
//       const userKeys = await ugd_backend.get_meilisearch_keys(UID.toString());
//       const cdk_caller = await ugd_backend.whoami();
//       console.log("cdk_caller: ", cdk_caller)
//       console.log('MeiliSearch keys retrieved successfully');
//       return userKeys;
//     } catch (error) {
//       console.error('Error retrieving MeiliSearch keys:', error);
//       return [];
//     }
//   };

//   const initializeMeiliSearchClient = async (): Promise<MeiliSearch | null> => {
//     if (!UID) {
//       console.error('User not authenticated');
//       return null;
//     }

//     try {
//       const userKeys = await getMeiliSearchKeys(UID);
//       if (userKeys.length > 0) {
//         const { meili_domain, meili_key } = userKeys[0];
//         console.log('MeiliSearch Domain:', meili_domain);
//         console.log('MeiliSearch Key:', meili_key);

//         const client = new MeiliSearch({
//           host: meili_domain,
//           apiKey: meili_key,
//         });

//         // Test the client connection
//         try {
//           await client.health();
//           console.log('MeiliSearch client initialized successfully');
//           return client;
//         } catch (error) {
//           console.error('Error testing MeiliSearch client connection:', error);
//         }
//       }
//     } catch (error) {
//       console.error('Error initializing MeiliSearch client:', error);
//     }
//     return null;
//   };

//   return {
//     client,
//     loading,
//     saveMeiliSearchKeys,
//     getMeiliSearchKeys,
//     initializeMeiliSearchClient,
//   };
// };

// export interface MeiliSearchKeys {
//   meili_domain: string;
//   meili_key: string;
//   slot: number;
// }

// export default useMeiliSearchClient;











// src/utils/MeiliSearchClient.tsx
import { useState, useEffect } from 'react';
import { MeiliSearch } from 'meilisearch';
import { ugd_backend } from '../../../declarations/ugd_backend';
import { useAuth } from './AuthProvider';
import { AiOutlineConsoleSql } from 'react-icons/ai';


interface MeiliSearchClientHook {
  client: any;
  loading: any;
  saveMeiliSearchKeys: (
    meiliDomain: string,
    meiliKey: string,
    slotIndex: number
  ) => Promise<boolean>;
  getMeiliSearchKeys: () => Promise<MeiliSearchKeys[]>;
  initializeMeiliSearchClient: () => Promise<MeiliSearch | null>;
}

const useMeiliSearchClient = (): MeiliSearchClientHook => {
  const { actor } = useAuth();
  const [client, setClient] = useState<MeiliSearch | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const initializeClient = async () => {
      if (await actor.whoami() == '2vxsx-fae') {
        setLoading(true);
        const initializedClient = await initializeMeiliSearchClient();
        setClient(initializedClient);
        setLoading(false);
      }
    };

    initializeClient();
  }, []);



  const saveMeiliSearchKeys = async (
    meiliDomain: string,
    meiliKey: string,
    slotIndex: number
  ): Promise<boolean> => {
    if (await actor.whoami() == '2vxsx-fae') {
      alert('Login to save keys')
      console.error('User not authenticated');
      return false;
    }

    try {
      console.log("cdk_caller: ", await actor.whoami())
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
    if (await actor.whoami() == '2vxsx-fae') {
      console.error('User not authenticated');
      return [];
    }
    try {
      const userKeys = await ugd_backend.get_meilisearch_keys();
      const cdk_caller = await ugd_backend.whoami();
      console.log('MeiliSearch keys retrieved successfully');
      return userKeys;
    } catch (error) {
      console.error('Error retrieving MeiliSearch keys:', error);
      return [];
    }
  };

  const initializeMeiliSearchClient = async (): Promise<MeiliSearch | null> => {
    if (await actor.whoami() == '2vxsx-fae') {
      console.error('User not authenticated');
      return null;
    }

    try {
      const userKeys = await getMeiliSearchKeys();
      if (userKeys.length > 0) {
        const { meili_domain, meili_key } = userKeys[0];
        console.log('MeiliSearch Domain:', meili_domain);
        console.log('MeiliSearch Key:', meili_key);

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
