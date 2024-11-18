import { _SERVICE as _SERVICELBRY } from "../../../../../../declarations/LBRY/LBRY.did";
import { createAsyncThunk } from "@reduxjs/toolkit";
import LedgerService from "@/utils/LedgerService";
import {
  getAlexActor,
  getIcpLedgerActor,
  getLbryActor,
} from "@/features/auth/utils/authUtils";

export interface TransactionType {
  type: string;
  from: string;
  to: string;
  amount: string;
  fee: string;
  timestamp: string;
}

// Create the async thunk for fetching transactions
const fetchTransaction = createAsyncThunk<
  TransactionType[], // Use the interface here for the return type of the thunk's payload
  string, // The argument type (account or principal string)
  { rejectValue: string }
>("icp_swap/fetchTransaction", async (account, { rejectWithValue }) => {
  try {
    const lbryActor = await getLbryActor();
    // const icpLedgerActor = getIcpLedgerActor();
    const alexActor = await getAlexActor();

    // Retrieve LBRY transactions
    const resultLbryPeek = await lbryActor.get_transactions({
      start: 0n,
      length: 1n,
    });
    const lbryResult = await lbryActor.get_transactions({
      start: 0n,
      length: resultLbryPeek.log_length,
    });

    const resultAlexPeek = await lbryActor.get_transactions({
      start: 0n,
      length: 1n,
    });
    const resultAlexResult = await alexActor.get_transactions({
      start: 0n,
      length: resultAlexPeek.log_length,
    });

    // Retrieve ALEX transactions
    const alexResult = await alexActor.get_transactions({
      start: 0n,
      length: resultAlexResult.log_length,
    });

    // Combine all transactions into a single array
    const allTransactions = [
      ...lbryResult.transactions,
      ...alexResult.transactions,
    ];
    // Filter transactions where the `to` or `from` owner matches the provided account
    const filteredTransactions = allTransactions.filter((transaction) => {
      // Check for the owner in different transaction types
      const toOwner =
          transaction.mint?.[0]?.to?.owner ||
          transaction.transfer?.[0]?.to?.owner ||
          // transaction.approve?.[0]?.to?.owner ||
          transaction.burn?.[0]?.spender[0]?.owner; 
  
      const fromOwner =
          transaction.transfer?.[0]?.from?.owner ||
          transaction.approve?.[0]?.from?.owner ||
          transaction.burn?.[0]?.from?.owner; // Include burn in fromOwner check
  
      return (
          toOwner?.toString() === account || fromOwner?.toString() === account
      );
  });
    console.log("filtered", filteredTransactions);

    // Convert transactions to human-readable format
    const LedgerServices = LedgerService();
    const humanReadableTransactions: TransactionType[] =
      filteredTransactions.map((transaction) => {
        const amount =
          transaction.mint?.[0]?.amount ||
          transaction.transfer?.[0]?.amount ||
          transaction.approve?.[0]?.amount ||
          transaction.burn?.[0]?.amount ||
          0n;

        const formattedAmount = LedgerServices.e8sToIcp(amount).toString();

        let feeAmount = 0n;

        // Check if the fee is an array and contains a bigint
        if (transaction.approve[0]?.fee) {
          feeAmount = transaction.approve[0]?.fee[0] ?? 0n;
        } else if (transaction.transfer[0]?.fee) {
          feeAmount = transaction.transfer[0]?.fee[0] ?? 0n;
        }

        const formattedFee = LedgerServices.e8sToIcp(feeAmount).toString();

        // Determine the fee label
        let feeLabel = "";
        if (alexResult.transactions.includes(transaction)) {
          feeLabel = formattedFee + " ALEX";
        } else if (lbryResult.transactions.includes(transaction)) {
          feeLabel = formattedFee + "LBRY";
        } else {
          feeLabel = "0";
        }

        let currencyLabel = "";
        if (lbryResult.transactions.includes(transaction)) {
          currencyLabel = " LBRY";
        } else if (alexResult.transactions.includes(transaction)) {
          currencyLabel = " ALEX";
        }

        const kind = transaction.kind;
        const to =
          transaction.mint?.[0]?.to?.owner ||
          transaction.transfer?.[0]?.to?.owner ||
          transaction.approve?.[0]?.from?.owner ||
          transaction.burn?.[0]?.from?.owner ||
          "N/A";
        const from =
          transaction.transfer?.[0]?.from?.owner ||
          transaction.approve?.[0]?.from?.owner ||
          transaction.burn?.[0]?.from?.owner ||
          "N/A";
        const timestamp = Number(transaction.timestamp / 1_000_000n);

        return {
          type: kind,
          from: from.toString(),
          to: to.toString(),
          amount: formattedAmount + currencyLabel,
          fee: feeLabel,
          timestamp: new Date(timestamp).toLocaleString(),
        };
      });

    // Sort transactions by timestamp in descending order (latest first)
    humanReadableTransactions.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return humanReadableTransactions;
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
  }
  return rejectWithValue(
    "An unknown error occurred while getting transactions"
  );
});

export default fetchTransaction;

// import { createAsyncThunk } from "@reduxjs/toolkit";
// import LedgerService from "@/utils/LedgerService";
// import { getAlexActor, getIcpLedgerActor, getLbryActor } from "@/features/auth/utils/authUtils";
// import { Principal } from "@dfinity/principal";

// // Define the structure for the mixed data type
// interface MixedTransaction {
//   kind: string;
//   mint?: { to: Uint8Array; amount: { e8s: bigint } }[];
//   transfer?: { to: Uint8Array; from: Uint8Array; amount: { e8s: bigint }; fee: { e8s: bigint } }[];
//   approve?: { from: Uint8Array; allowance: { e8s: bigint }; spender: Uint8Array }[];
//   burn?: { from: Uint8Array; amount: { e8s: bigint } }[];
//   timestamp: bigint;
//   transaction?: {
//     operation?: { Transfer?: any; Mint?: any; Burn?: any; Approve?: any }[];
//     created_at_time: { timestamp_nanos: bigint };
//   };
// }

// export interface TransactionType {
//   type: string;
//   from: string;
//   to: string;
//   amount: string;
//   timestamp: string;
// }

// // Create the async thunk for fetching transactions
// const getLBRYTransactions = createAsyncThunk<
//   TransactionType[],
//   string,
//   { rejectValue: string }
// >(
//   "icp_swap/getLBRYTransactions",
//   async (account, { rejectWithValue }) => {
//     try {
//       const lbryActor = await getLbryActor();
//       const icpLedgerActor = await getIcpLedgerActor();
//       const alexActor = await getAlexActor();

//       const lbryResult = await lbryActor.get_transactions({ start: 0n, length: 100n });
//       const icpLedgerResult = await icpLedgerActor.query_blocks({ start: 0n, length: 100n });
//       const alexResult = await alexActor.get_transactions({ start: 0n, length: 100n });
//       const icpTranx= icpLedgerResult.blocks.map((block) => ({
//         kind: block.transaction.operation?.[0] ? Object.keys(block.transaction.operation[0])[0] : 'unknown',
//         transaction: block.transaction,
//         timestamp: block.timestamp.timestamp_nanos,
//       }));
//       console.log("icp tranx ",icpTranx);
//       const allTransactions: any[] = [
//         ...lbryResult.transactions,

//         ...alexResult.transactions,
//       ];
//       console.log("all transaction ",allTransactions);
//       // Filter transactions based on the provided account
//       const filteredTransactions = allTransactions.filter((item) => {
//         let toOwner: string | undefined;
//         let fromOwner: string | undefined;

//         // Handle `mint`, `transfer`, `burn`, and `approve` fields
//         if (item.kind === "mint" && item.mint && item.mint[0]) {
//           toOwner = Principal.fromUint8Array(item.mint[0].to).toText();
//         } else if (item.kind === "transfer" && item.transfer && item.transfer[0]) {
//           toOwner = Principal.fromUint8Array(item.transfer[0].to).toText();
//           fromOwner = Principal.fromUint8Array(item.transfer[0].from).toText();
//         } else if (item.kind === "burn" && item.burn && item.burn[0]) {
//           fromOwner = Principal.fromUint8Array(item.burn[0].from).toText();
//         } else if (item.kind === "approve" && item.approve && item.approve[0]) {
//           fromOwner = Principal.fromUint8Array(item.approve[0].from).toText();
//         }

//         // Handle transactions with `operation` arrays
//         if (item.transaction?.operation) {
//           const operation = item.transaction.operation[0];
//           if (operation.Transfer) {
//             toOwner = Principal.fromUint8Array(operation.Transfer.to).toText();
//             fromOwner = Principal.fromUint8Array(operation.Transfer.from).toText();
//           } else if (operation.Mint) {
//             toOwner = Principal.fromUint8Array(operation.Mint.to).toText();
//           } else if (operation.Burn) {
//             fromOwner = Principal.fromUint8Array(operation.Burn.from).toText();
//           } else if (operation.Approve) {
//             fromOwner = Principal.fromUint8Array(operation.Approve.from).toText();
//           }
//         }
//         // console.log("owner ",toOwner+ " from owner:"+fromOwner);
//         return toOwner === account || fromOwner === account;
//       });

//       const LedgerServices = LedgerService();
//       console.log("Filtered ",filteredTransactions);
//       // Map the filtered transactions to a human-readable format
//       const humanReadableTransactions: TransactionType[] = filteredTransactions.map((item) => {
//         let amount = 0n;
//         let kind = item.kind;
//         let to = "N/A";
//         let from = "N/A";
//         let timestamp = new Date(Number(item.timestamp / 1_000_000n)).toLocaleString();

//         if (item.kind === "mint" && item.mint && item.mint[0]) {
//           amount = item.mint[0].amount.e8s;
//           to = Principal.fromUint8Array(item.mint[0].to).toText();
//         } else if (item.kind === "transfer" && item.transfer && item.transfer[0]) {
//           amount = item.transfer[0].amount.e8s;
//           to = Principal.fromUint8Array(item.transfer[0].to).toText();
//           from = Principal.fromUint8Array(item.transfer[0].from).toText();
//         } else if (item.kind === "burn" && item.burn && item.burn[0]) {
//           amount = item.burn[0].amount.e8s;
//           from = Principal.fromUint8Array(item.burn[0].from).toText();
//         } else if (item.kind === "approve" && item.approve && item.approve[0]) {
//           amount = item.approve[0].allowance.e8s;
//           from = Principal.fromUint8Array(item.approve[0].from).toText();
//         }

//         if (item.transaction?.operation) {
//           const operation = item.transaction.operation[0];
//           if (operation.Transfer) {
//             amount = operation.Transfer.amount.e8s;
//             to = Principal.fromUint8Array(operation.Transfer.to).toText();
//             from = Principal.fromUint8Array(operation.Transfer.from).toText();
//           } else if (operation.Mint) {
//             amount = operation.Mint.amount.e8s;
//             to = Principal.fromUint8Array(operation.Mint.to).toText();
//           } else if (operation.Burn) {
//             amount = operation.Burn.amount.e8s;
//             from = Principal.fromUint8Array(operation.Burn.from).toText();
//           } else if (operation.Approve) {
//             amount = operation.Approve.allowance.e8s;
//             from = Principal.fromUint8Array(operation.Approve.from).toText();
//           }
//         }

//         const formattedAmount = LedgerServices.e8sToIcp(amount).toString();

//         return {
//           type: kind,
//           from,
//           to,
//           amount: formattedAmount,
//           timestamp,
//         };
//       });

//       return humanReadableTransactions;
//     } catch (error) {
//       console.error(error);
//       if (error instanceof Error) {
//         return rejectWithValue(error.message);
//       }
//     }
//     return rejectWithValue("An unknown error occurred while getting transactions");
//   }
// );

// export default getLBRYTransactions;
