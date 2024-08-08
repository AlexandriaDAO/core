import { Index } from "meilisearch";

export async function getAllDocumentsByManifest(index: Index | null = null, manifest: string = '') {
    if (!index || !manifest) {
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

            // Filter the documents for the matching manifest id
            const matchingDocs = documentsBatch.results.filter((doc:any) => doc.manifest === manifest);
            allDocuments = allDocuments.concat(matchingDocs);

            // Break the loop if there are no more documents to retrieve
            if (documentsBatch.results.length < limit) {
                break;
            }

            offset += limit;
        }

        console.log(`Found ${allDocuments.length} documents for asset: ${manifest}`);
        return allDocuments;
    } catch (error) {
        console.error('Error retrieving documents from Meilisearch:', error);
        return [];
    }
}



export async function deleteAllDocumentsByManifest(index:Index|null = null, manifest:string = '') {
    if(!index || !manifest) {
        console.log('Invalid index or asset');
        return;
    };

    const documents = await getAllDocumentsByManifest(index, manifest);

    if (documents.length === 0) {
        console.log('No documents found with the specified Manifest id');
        return;
    }

    try {
        const documentIds = documents.map((doc:any) => doc.id);
        await index.deleteDocuments(documentIds);
        console.log(`Deleted ${documentIds.length} documents with manifest: ${manifest}`);
    } catch (error) {
        console.error('Error deleting documents from Meilisearch:', error);
    }
}
