import axios from 'axios';
import { ApolloClient, InMemoryCache, gql, ApolloLink } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';
import { onError } from '@apollo/client/link/error';
import { Observable } from '@apollo/client/utilities';
import { Transaction } from '@/apps/Modules/shared/types/queries';
import { getBlockHeightForTimestamp } from './arweaveHelpers';
import { ARWEAVE_CONFIG, getArweaveUrl } from '../config/arweaveConfig';

const TIMEOUT_MS = 30000; // 30 seconds

// Create a timeout link
const timeoutLink = new ApolloLink((operation, forward) => {
  return new Observable(observer => {
    const timeoutId = setTimeout(() => {
      observer.error(new Error('Request timed out'));
    }, TIMEOUT_MS);

    const subscription = forward(operation).subscribe({
      next: result => {
        clearTimeout(timeoutId);
        observer.next(result);
      },
      error: error => {
        clearTimeout(timeoutId);
        observer.error(error);
      },
      complete: () => {
        clearTimeout(timeoutId);
        observer.complete();
      }
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  });
});

const logLink = new ApolloLink((operation, forward) => {
  return forward(operation);
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  if (networkError) console.error(`[Network error]: ${networkError}`);
});

const httpLink = new HttpLink({
  uri: ARWEAVE_CONFIG.GOLDSKY_ENDPOINT
});

const arweaveNetClient = new ApolloClient({
  link: ApolloLink.from([errorLink, timeoutLink, logLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all'
    }
  }
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

// Add pageSize constant at the top of the file
const PAGE_SIZE = 100;

// Update fetchTransactions function
export async function fetchTransactions(
  nftIds?: string[],
  contentTypes?: string[],
  amount?: number,
  ownerFilter?: string,
  after?: string,
  minBlock?: number,
  maxBlock?: number
): Promise<Transaction[]> {
  try {
    // Add validation
    if (amount && (isNaN(amount) || amount <= 0)) {
      console.error('Invalid amount provided:', amount);
      return [];
    }

    let allTransactions: Transaction[] = [];

    // If nftIds is provided, fetch those transactions
    if (nftIds && nftIds.length > 0) {
      const result = await arweaveNetClient.query({
        query: gql`
          query FetchTransactionsByIds($ids: [ID!]!) {
            transactions(ids: $ids) {
              edges {
                cursor
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
        variables: { ids: nftIds },
      });

      if (!result.data?.transactions?.edges) {
        return [];
      }

      // Process transactions...
      const fetchedTransactions = result.data.transactions.edges.map((edge: any) => ({
        id: edge.node.id,
        owner: edge.node.owner.address,
        tags: edge.node.tags,
        block: edge.node.block,
        data: edge.node.data,
        cursor: edge.cursor
      }));

      allTransactions = [...allTransactions, ...fetchedTransactions];
      return allTransactions;
    }

    const tags: any[] = [];
    if (contentTypes && contentTypes.length > 0) {
      tags.push({ name: 'Content-Type', values: contentTypes });
    }

    const variables: any = {
      first: Math.min(PAGE_SIZE, amount ?? PAGE_SIZE),
      tags: tags.length > 0 ? tags : undefined,
      owners: ownerFilter ? [ownerFilter] : undefined,
      after: after,
      minBlock,
      maxBlock
    };

    const result = await arweaveNetClient.query({
      query: FETCH_RECENT_QUERY,
      variables: variables,
    });

    if (!result.data?.transactions?.edges) {
      return [];
    }

    const newTransactions = result.data.transactions.edges.map((edge: any) => ({
      id: edge.node.id,
      owner: edge.node.owner.address,
      tags: edge.node.tags,
      block: edge.node.block,
      data: edge.node.data,
      cursor: edge.cursor
    }));

    allTransactions = [...allTransactions, ...newTransactions];
    return allTransactions.slice(0, amount);

  } catch (error) {
    console.error('Error in fetchTransactions:', {
      error,
      params: {
        nftIds,
        contentTypes,
        amount,
        ownerFilter,
        after,
        minBlock,
        maxBlock
      }
    });
    throw error;
  }
}

// Helper function to chunk an array
function chunk<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}
