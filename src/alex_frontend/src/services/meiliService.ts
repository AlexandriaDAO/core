import MeiliSearch, { EnqueuedTask, Index } from "meilisearch";
import { ibe_decrypt } from "./vetkdService";

export const initializeClient = async (host:string = '', key: string = ''): Promise<MeiliSearch|null> => {
    if( host === '' ){
        console.log("Host is empty");
        return null;
    }

    if( key === '' ){
        console.log("Key is empty");
        return null;
    }

    try{
        const decrypted = await ibe_decrypt(key)

        const client = new MeiliSearch({
            host,
            apiKey: decrypted,
        });
        if(await client.isHealthy()){
            console.log('Client ('+host+') is healthy');
            return client;
        }
        console.log('Client ('+host+') is not healthy');
    }catch(error){
        console.error('Host('+host+') is not working, error: ', error);
    }

    return null;
}

export async function waitForTaskCompletion(client: MeiliSearch, taskUid: number): Promise<void> {
    let task = await client.getTask(taskUid);
    while (task.status !== 'succeeded') {
        if (task.status === 'failed') {
            throw new Error(`Task failed: ${task.error}`);
        }
        if (task.status === 'canceled') {
            throw new Error(`Task canceled: ${task.error}`);
        }

        // Wait for 100 milliseconds before checking again
        await new Promise(resolve => setTimeout(resolve, 100));
        task = await client.getTask(taskUid);
    }
}


async function getIndex(client: MeiliSearch, index_uid: string): Promise<Index|null> {
    try{
        const index = await client.getIndex(index_uid);
        await index.getStats();  // Attempt to get stats to confirm index exists
        return index;
    } catch (error) {
        console.log("Index not found:", error);
    }
    return null;
}


export const initializeIndex = async (client:MeiliSearch, index_uid: string = ''): Promise<Index|null> => {
    if( !client ){
        console.log("Client is empty");
        return null;
    }

    if( index_uid === '' ){
        console.log("IndexUID is empty");
        return null;
    }

    if( !await client.isHealthy() ){
        console.log("Client is not working");
        return null;
    }

    let index: Index<Record<string, any>>|null;

    // Try to fetch the index or create it if it doesn't exist
    try {
        index = await getIndex(client, index_uid)

        if(index) return index;

        const task: EnqueuedTask = await client.createIndex(index_uid);

        await waitForTaskCompletion(client, task.taskUid)

        index = await getIndex(client, index_uid)

        return index;
    } catch (error) {
        console.log("Index not found, and could not be created:", error);
    }

    return null;
}

// // loop through all keys return first working/healthy client or null
// export const getClient = async(): Promise<MeiliSearch | null> => {
//     const userKeys = await getKeys();
//     for(let count = 0 ; count< userKeys.length ; count ++){
//         let key = userKeys[count];
//         const client = await initializeClient(key.meili_domain, key.meili_key)
//         if(client) return client;
//     }
//     console.log("No working key available");
//     return null;
// }