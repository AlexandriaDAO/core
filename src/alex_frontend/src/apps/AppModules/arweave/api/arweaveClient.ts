import axios from 'axios';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';
import { ApolloLink } from '@apollo/client/link/core';
import { Transaction } from '@/apps/AppModules/arweave/types/queries';
import { getBlockHeightForTimestamp } from './arweaveHelpers';
import { ARWEAVE_CONFIG, getArweaveUrl } from '../config/arweaveConfig';

const logLink = new ApolloLink((operation, forward) => {
  console.log('GraphQL Request:', {
    operationName: operation.operationName,
    query: operation.query.loc?.source.body,
    variables: operation.variables,
  });
  return forward(operation);
});

const httpLink = new HttpLink({
  uri: ARWEAVE_CONFIG.GRAPHQL_ENDPOINT,
});

const arweaveNetClient = new ApolloClient({
  link: ApolloLink.from([logLink, httpLink]),
  cache: new InMemoryCache(),
});

const FETCH_RECENT_QUERY = gql`
  query Transactions($tags: [TagFilter!], $first: Int!, $after: String, $minBlock: Int, $maxBlock: Int, $owners: [String!]) {
    transactions(
      tags: $tags,
      first: $first,
      after: $after,
      block: { min: $minBlock, max: $maxBlock },
      owners: $owners
    ) {
      edges {
        cursor
        node {
          id
          owner {
            address
          }
          block {
            height
            timestamp
          }
          tags {
            name
            value
          }
          data {
            size
            type
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

// Update fetchTransactions function
export async function fetchTransactions(
  nftIds?: string[],
  contentTypes?: string[],
  amount?: number,
  maxTimestamp?: number,
  owner?: string,
  minBlock?: number,
  maxBlock?: number
): Promise<Transaction[]> {
  try {
    const pageSize = 100;
    let allTransactions: Transaction[] = [];

    // If nftIds is provided, fetch only those transactions
    if (nftIds && nftIds.length > 0) {
      const idChunks = chunk(nftIds, pageSize);
      for (const idChunk of idChunks) {
        const result = await arweaveNetClient.query({
          query: gql`
            query FetchTransactionsByIds($ids: [ID!]!) {
              transactions(ids: $ids) {
                edges {
                  node {
                    id
                    owner { address }
                    block { height timestamp }
                    tags { name value }
                    data { size type }
                  }
                }
              }
            }
          `,
          variables: { ids: idChunk },
        });

        if (result.data && result.data.transactions && result.data.transactions.edges) {
          const fetchedTransactions = result.data.transactions.edges.map((edge: any) => ({
            id: edge.node.id,
            owner: edge.node.owner.address,
            tags: edge.node.tags,
            block: edge.node.block,
            data: edge.node.data,
          }));

          allTransactions = [...allTransactions, ...fetchedTransactions];
        }
      }

      // Apply filters to the fetched transactions
      allTransactions = allTransactions.filter((tx: Transaction) => {
        // Filter by owner if specified
        if (owner && tx.owner !== owner) {
          return false;
        }

        // Filter by maxTimestamp if specified
        if (maxTimestamp && tx.block && tx.block.timestamp > maxTimestamp) {
          return false;
        }

        // Filter by contentTypes if specified
        if (contentTypes && contentTypes.length > 0) {
          const contentType = tx.tags.find(tag => tag.name === 'Content-Type')?.value;
          if (!contentType || !contentTypes.includes(contentType)) {
            return false;
          }
        }

        // Filter by block range if specified
        if (minBlock !== undefined && maxBlock !== undefined && tx.block) {
          if (tx.block.height < minBlock || tx.block.height > maxBlock) {
            return false;
          }
        }

        return true;
      });

      // Limit the number of transactions if amount is specified
      if (amount) {
        allTransactions = allTransactions.slice(0, amount);
      }

      return allTransactions;
    }

    // If no nftIds provided, use the existing logic for fetching transactions
    if (minBlock === undefined || maxBlock === undefined) {
      // Fetch current network info to get the max block height
      const { data: networkInfo } = await axios.get(getArweaveUrl('info'));
      const currentBlockHeight = parseInt(networkInfo.height, 10);
      
      if (maxTimestamp) {
        maxBlock = await getBlockHeightForTimestamp(maxTimestamp);
      } else {
        maxBlock = currentBlockHeight;
      }
      
      // Default minBlock to a range of recent blocks if not provided
      minBlock = Math.max(0, maxBlock - 50000);
    }

    while (true) {
      const tags: any[] = [];
      if (contentTypes && contentTypes.length > 0) {
        tags.push({ name: 'Content-Type', values: contentTypes });
      }

      const variables: any = {
        first: Math.min(pageSize, amount ? amount : pageSize),
        after: null,
        tags: tags.length > 0 ? tags : undefined,
        minBlock: minBlock,
        maxBlock: maxBlock,
        owners: owner ? [owner] : undefined,
      };

      console.log('GraphQL query variables:', variables);

      const result = await arweaveNetClient.query({
        query: FETCH_RECENT_QUERY,
        variables: variables,
      });

      if (
        !result.data ||
        !result.data.transactions ||
        !result.data.transactions.edges
      ) {
        console.error('Unexpected response structure:', result);
        break;
      }

      const newTransactions = result.data.transactions.edges.map((edge: any) => ({
        id: edge.node.id,
        owner: edge.node.owner.address,
        tags: edge.node.tags,
        block: edge.node.block,
        data: edge.node.data,
      }));

      // Filter transactions by maxTimestamp if provided
      const filteredTransactions = newTransactions.filter((tx: Transaction) => {
        if (maxTimestamp && tx.block && tx.block.timestamp > maxTimestamp) {
          return false;
        }
        return true;
      });

      allTransactions = [...allTransactions, ...filteredTransactions];

      if (amount && allTransactions.length >= amount) {
        break;
      }
    }

    // Filter transactions by maxTimestamp if provided
    if (maxTimestamp) {
      allTransactions = allTransactions.filter((tx: Transaction) => 
        !tx.block || tx.block.timestamp <= maxTimestamp
      );
    }

    return allTransactions.slice(0, amount);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

// Helper function to chunk an array
function chunk<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}
