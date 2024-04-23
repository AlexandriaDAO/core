import MeiliSearch from "meilisearch";
import { MeiliSearchKeys } from "src/declarations/ugd_backend/ugd_backend.did";
import { ugd_backend } from '../../../declarations/ugd_backend';

export const getKeys = async(): Promise<MeiliSearchKeys[]> => {
    try {
        return await ugd_backend.get_meilisearch_keys();
    } catch (error) {
        console.error('Error retrieving MeiliSearch keys:', error);
    }
    return [];
};

// loop through all keys return first working/healthy client or null
export const getClient = async(): Promise<MeiliSearch | null> => {
    try {
        const userKeys = await getKeys();
        for(let count = 0 ; count< userKeys.length ; count ++){
            let key = userKeys[count];
            try{
                const client = new MeiliSearch({
                    host: key.meili_domain,
                    apiKey: key.meili_key,
                });
    
                if(await client.isHealthy()){
                  console.log('Client ('+key.meili_domain+') initialized successfully');
                  return client;
                }
                console.log('Host('+key.meili_domain+') is not healthy');
            }catch(error){
                console.error('Host('+key.meili_domain+') is not working, error: ', error);
            }
        }
        console.log("No working key available");
    } catch (error) {
        console.error("Error initializing MeiliSearch client:", error);
    }
    return null;
}