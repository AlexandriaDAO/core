import axios from 'axios';
import { ARWEAVE_CONFIG } from '../config/arweaveConfig';

const SINGLE_TX_QUERY = `
query GetTransaction($id: ID!) {
  transaction(id: $id) {
    id
    owner {
      address
    }
  }
}`;

export interface SimpleTxResponse {
  id: string;
  owner: string;
}

export async function fetchSimpleTransaction(txId: string): Promise<SimpleTxResponse | null> {
  try {
    const { data: graphqlResponse } = await axios.post(
      ARWEAVE_CONFIG.ARWEAVE_ENDPOINT,
      {
        query: SINGLE_TX_QUERY,
        variables: { id: txId }
      }
    );

    if (!graphqlResponse.data?.transaction) {
      console.error('No transaction found');
      return null;
    }

    const tx = graphqlResponse.data.transaction;
    return {
      id: tx.id,
      owner: tx.owner.address
    };
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }
}
