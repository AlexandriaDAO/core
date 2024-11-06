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
// const fetchTransaction = createAsyncThunk<
//   TransactionType[],
//   string,
//   { rejectValue: string }
// >(
//   "icp_swap/fetchTransaction",
//   async (account, { rejectWithValue }) => {
//     try {
//       const lbryActor = await getLbryActor();
//       const icpLedgerActor = await getIcpLedgerActor();
//       const alexActor = await getAlexActor();

//       const lbryResult = await lbryActor.get_transactions({ start: 0n, length: 100n });
//       const icpLedgerResult = await icpLedgerActor.query_blocks({ start: 0n, length: 100n });
//       const alexResult = await alexActor.get_transactions({ start: 0n, length: 100n });

//       const allTransactions: any[] = [
//         ...lbryResult.transactions,
//         ...icpLedgerResult.blocks.map((block) => ({
//           kind: block.transaction.operation?.[0] ? Object.keys(block.transaction.operation[0])[0] : 'unknown',
//           transaction: block.transaction,
//           timestamp: block.timestamp.timestamp_nanos,
//         })),
//         ...alexResult.transactions,
//       ];

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
//         console.log("owner ",toOwner+ " from owner:"+fromOwner);
//         return toOwner === account || fromOwner === account;
//       });

//       const LedgerServices = LedgerService();
//       console.log("Filtered ",filteredTransactions);
//       // Map the filtered transactions to a human-readable format
//       const humanReadableTransactions: TransactionType[] = filteredTransactions.map((item) => {
//         let amount = 0n;
//         let kind = item.knd;
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

// export default fetchTransaction;