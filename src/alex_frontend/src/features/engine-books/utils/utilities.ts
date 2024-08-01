import { Index } from "meilisearch";

// export async function getAllDocumentsByAssetId(index:Index|null = null, assetId:string= '') {
//     if(!index || !assetId) {
//         console.log('Invalid index or asset id');
//         return [];
//     };

    

//     try {
//         let allDocuments:any = [];
//         let offset = 0;
//         const limit = 100; // Meilisearch has a maximum limit of 1000 per request
//         while (true) {
//             const searchResults = await index.search(assetId, {
//                 attributesToSearchOn: ['asset_id'],
//                 attributesToRetrieve: ['id', 'asset_id'],

//                 offset: offset,
//                 limit: limit,
//             });


//             const matchingDocs = searchResults.hits.filter(hit => hit.asset_id === assetId);
//             allDocuments = allDocuments.concat(matchingDocs);

//             if(assetId == 'A57wypzjRl-QdK9ld0k7d-DyuNhU_Y8BPwmiZ3rcGW8'){
//                 console.log('searchResults',searchResults);
//                 console.log('matchingDocs', matchingDocs);
//                 console.log('all', allDocuments);
//                 console.log('offset', offset);
//                 console.log('limit', limit);
//             }


//             if (searchResults.hits.length < limit) {
//                 // We've retrieved all matching documents
//                 break;
//             }

//             offset += limit;
//         }

//         console.log(`Found ${allDocuments.length} documents with for asset: ${assetId}`);
//         return allDocuments;
//     } catch (error) {
//       console.error('Error retrieving documents from Meilisearch:', error);
//       return [];
//     }
// }



export async function getAllDocumentsByAssetId(index: Index | null = null, assetId: string = '') {
    if (!index || !assetId) {
        console.log('Invalid index or asset id');
        return [];
    }

    try {
        let allDocuments: any = [];
        let offset = 0;
        const limit = 1000; // Meilisearch maximum limit per request

        while (true) {
            // Retrieve documents from the index
            const documentsBatch = await index.getDocuments({
                offset: offset,
                limit: limit,
            });

            // Filter the documents for the matching asset_id
            const matchingDocs = documentsBatch.results.filter((doc:any) => doc.asset_id === assetId);
            allDocuments = allDocuments.concat(matchingDocs);

            // Break the loop if there are no more documents to retrieve
            if (documentsBatch.results.length < limit) {
                break;
            }

            offset += limit;
        }

        console.log(`Found ${allDocuments.length} documents for asset: ${assetId}`);
        return allDocuments;
    } catch (error) {
        console.error('Error retrieving documents from Meilisearch:', error);
        return [];
    }
}



export async function deleteAllDocumentsByAssetId(index:Index|null = null, assetId:string = '') {
    if(!index || !assetId) {
        console.log('Invalid index or asset');
        return;
    };

    const documents = await getAllDocumentsByAssetId(index, assetId);

    if (documents.length === 0) {
        console.log('No documents found with the specified asset id');
        return;
    }

    try {
        const documentIds = documents.map((doc:any) => doc.id);
        await index.deleteDocuments(documentIds);
        console.log(`Deleted ${documentIds.length} documents with asset: ${assetId}`);
    } catch (error) {
      console.error('Error deleting documents from Meilisearch:', error);
    }
}
