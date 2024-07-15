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





/*
type1:0-9

(subtypes also 0-9)
subtype0:bool
subtype2:bool
...
subytype9:bool

era: (1-15)


[
  [-10000, -2000, "Prehistoric"],
  [-2000, -500, "Ancient"],
  [-500, 0, "Classical Antiquity"],
  [0, 500, "Late Antiquity and Early Middle Ages"],
  [500, 1000, "Early Medieval"],
  [1000, 1300, "High Midieval"],
  [1300, 1500, "Late Middle Age, Early Renaissance"],
  [1500, 1700, "Renaissance"],
  [1700, 1800, "Age of Enlightenment"],
  [1800, 1850, "Early Industrial"],
  [1850, 1900, "Late Industrial"],
  [1900, 1950, "Early 20th Century"],
  [1950, 1975, "Post-War"],
  [1975, 2000, "Late 20th Century"],
  [2000, 2020, "Early 21st Century"],
  [2020, 10000, "Contemporary"]
]

*/


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

export async function fetchTransactions(): Promise<Transaction[]> {
  try {
    const result = await client.query({
      query: gql`
        query {
          transactions(
            first: 100,
            tags: [
              { name: "Content-Type", values: ["application/epub+zip"] },
              { name: "application-id", values: ["UncensoredGreats"] },
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
  try {
    const query = await client.query({
      query: gql`
        query {
          transactions(
            first: 100,
            tags: [
              { name: "Content-Type", values: ["application/epub+zip"] },
              { name: "application-id", values: ["UncensoredGreats"] },
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


