// // This field will be important if people begin to upload spam transactions with our app's metadata.
// // Will use as a secondary database for queries, likely scallable to the thousands.
// .ids(legitimateTransactionIds) // Add this line to filter by specific transaction IDs

// // Simple Irys Query Package Vesion
// import Query from "@irys/query";

// export async function fetchTransactions() {
//   const myQuery = new Query();
//   const results = await myQuery
//     .search("irys:transactions") 
//     .tags([
//       { name: "Content-Type", values: ["application/epub+zip"] },
//       { name: "application-id", values: ["UncensoredGreats"] },
//       { name: "title", values: ["true"] },
//       { name: "author", values: ["Agnes Giberne"]},
//       { name: "language", values: ["en"]},
//       { name: "type", values: ["1", "2", "3", "8"] },      
//     ])
//     .sort("ASC") // Latest or oldest.
//     .limit(20);
//   return results;
// }


// Content-Type: application/epub+zip 
// application-id: UncensoredGreats 
// minting_number: 6 
// title: The Divine Comedy 
// fiction: true 
// language: en 
// author_first: Dante 
// author_last: Alighieri 
// type: 2 
// type0: 0 
// type1: 0 
// type2: 0 
// type3: 1 
// type4: 0 
// type5: 0 
// type6: 0 
// type7: 0 
// type8: 0 
// type9: 0 
// era: 6
// The type field ranges from 0-9 and can only be one of them. The types1, type2, ... are a zero or 1 and each book has three 1s and seven 0s, as they represent 3 subcategories that a user must choose.
// Then era is a number from 1-16, and the rest should be pretty self explanatory.



import { ApolloClient, ApolloQueryResult, InMemoryCache, gql } from '@apollo/client';

interface Tag {
  name: string;
  value: string;
}

interface Transaction {
  id: string;
  tags: Tag[];
  address: string;
  timestamp: number;
}

const client = new ApolloClient({
  uri: 'https://arweave.mainnet.irys.xyz/graphql',
  cache: new InMemoryCache()
});

const APP_ID = process.env.DFX_NETWORK === "ic" ? "testingAlexandria" : "UncensoredGreats";

export async function fetchTransactions(): Promise<Transaction[]> {
  try {
    const result = await client.query({
      query: gql`
      query {
        transactions(
          first: 100,
          tags: [
            { name: "Content-Type", values: ["application/epub+zip"] },
            { name: "application-id", values: ["${APP_ID}"] },
            ]
            ) {
              edges {
                node {
                  id
                  tags {
                    name
                    value
                    }
                    address
                    timestamp
                    }
                    }
                    }
                    }
                    `
                  });
                  
                  const filterConditions = [
                    // { name: "author", values: ["William Shakespeare", "Agnes Giberne"] },
                    { name: "language", values: ["en"] },
                    { name: "type", values: ["1", "2", "3", "8"] }
                  ];
                  
                  const filteredTransactions = result.data.transactions.edges.filter((edge: any) => {
      const tags = edge.node.tags;
      return filterConditions.some(condition => {
        const matchingTag = tags.find((tag: { name: string; }) => tag.name === condition.name);
        return matchingTag && condition.values.includes(matchingTag.value);
      });
    });
    
    return filteredTransactions.map((edge: any) => ({
      id: edge.node.id,
      tags: edge.node.tags,
      address: edge.node.address,
      timestamp: edge.node.timestamp
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

export async function getQuery(): Promise<ApolloQueryResult<any>> {
  console.log("DFX_NETWORK:", process.env.DFX_NETWORK);
  console.log("APP_ID: ", APP_ID);
  try {
    const query = await client.query({
      query: gql`
        query {
          transactions(
            first: 100,
            tags: [
              { name: "Content-Type", values: ["application/epub+zip"] },
              { name: "application-id", values: ["${APP_ID}"] },
            ]
          ) {
            edges {
              node {
                id
                tags {
                  name
                  value
                }
                address
                timestamp
              }
            }
          }
        }
      `
    });
    return query;
  } catch (error) {
    console.error('Error getting query results:', error);
    throw error;
  }
}











// export async function fetchAll(): Promise<Transaction[]> {
//   console.log('fetchAll');
//   try {
//     const result = await client.query({
//       query: gql`
//         query {
//           transactions(
//             first: 100,
//             tags: [
//               { name: "Content-Type", values: ["application/epub+zip"] },
//               { name: "application-id", values: ["UncensoredGreats"] },
//             ]
//           ) {
//             edges {
//               node {
//                 id
//                 tags {
//                   name
//                   value
//                 }
//                 address
//                 timestamp
//               }
//             }
//           }
//         }
//       `
//     });

//     return result.data.transactions.edges.map((edge: any) => ({
//       id: edge.node.id,
//       tags: edge.node.tags,
//       address: edge.node.address,
//       timestamp: edge.node.timestamp
//     }));
//   } catch (error) {
//     console.error('Error fetching all transactions:', error);
//     throw error;
//   }
// }

// export async function fetchFiltered({types, languages}: {types: string[], languages: string[]} = {types: [], languages: []}): Promise<Transaction[]> {
//   console.log('fetchFiltered');

//   try {
//     const result = await client.query({
//       query: gql`
//         query {
//           transactions(
//             first: 100,
//             tags: [
//               { name: "Content-Type", values: ["application/epub+zip"] },
//               { name: "application-id", values: ["UncensoredGreats"] },
//             ]
//           ) {
//             edges {
//               node {
//                 id
//                 tags {
//                   name
//                   value
//                 }
//                 address
//                 timestamp
//               }
//             }
//           }
//         }
//       `
//     });

//     const filterConditions:any = [
//       { name: "language", values: languages},
//       { name: "type", values: types}
//     ];

//     console.log(filterConditions, 'filterconditions');
//     const filteredTransactions = result.data.transactions.edges.filter((edge: any) => {
//       const tags = edge.node.tags;
//       return filterConditions.some((condition: { name: string; values: string | any[]; }) => {
//         const matchingTag = tags.find((tag: { name: string; }) => tag.name === condition.name);
//         return matchingTag && condition.values.includes(matchingTag.value);
//       });
//     });

//     return filteredTransactions.map((edge: any) => ({
//       id: edge.node.id,
//       tags: edge.node.tags,
//       address: edge.node.address,
//       timestamp: edge.node.timestamp
//     }));
//   } catch (error) {
//     console.error('Error fetching filtered transactions:', error);
//     throw error;
//   }
// }



/*


ToDo fixes:


postQL filtering in the book-portal page.
Dynamic filtering with UI peices.



*/
