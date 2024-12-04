import { fetchTransactionsApi } from "@/apps/Modules/LibModules/arweaveSearch/api/arweaveApi";
import { fetchTransactions } from "@/apps/Modules/LibModules/arweaveSearch/api/arweaveClient";
import { setTransactions } from "@/apps/Modules/shared/state/content/contentDisplaySlice";
import { loadContentForTransactions } from "@/apps/Modules/shared/state/content/contentDisplayThunks";
import { getIcrc7Actor } from "@/features/auth/utils/authUtils";
import { natToArweaveId } from "@/utils/id_convert";
import { Principal } from "@dfinity/principal";
import { createAsyncThunk } from "@reduxjs/toolkit";

const getUserIcrc7Tokens = createAsyncThunk<
  { tokenId: string; arweaveId: string }[], // structure
  string,
  { rejectValue: string }
>(
  "emporium/getUserIcrc7Tokens",
  async (userPrincipal, { rejectWithValue, dispatch }) => {
    try {
      const actorIcrc7 = await getIcrc7Actor();
      const result = await actorIcrc7.icrc7_tokens_of(
        {
          owner: Principal.fromText(userPrincipal),
          subaccount: [],
        },
        [],
        []
      );
      console.log("Raw result:", result);
      const ids = [""];
      const tokens = Array.isArray(result)
        ? result.map((value) => {
            const arweaveId = natToArweaveId(value);
            console.log("The value is", value);
            console.log("Arware id is", arweaveId);
            ids.push(arweaveId);
            return {
              tokenId: value.toString(),
              arweaveId: arweaveId,
            };
          })
        : [];

      const fetchedTransactions = await fetchTransactionsApi({ nftIds: ids });
      console.log("transactions are ", fetchedTransactions);
      dispatch(setTransactions(fetchedTransactions));

      await dispatch(loadContentForTransactions(fetchedTransactions));

      return tokens;
    } catch (error) {
      console.error("Error fetching ICRC7 tokens:", error);
      return rejectWithValue(
        "An unknown error occurred while fetching ICRC7 tokens"
      );
    }
  }
);

export default getUserIcrc7Tokens;
