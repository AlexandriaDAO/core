import { getIcrc7Actor } from "@/features/auth/utils/authUtils";
import { natToArweaveId } from "@/utils/id_convert";
import { Principal } from "@dfinity/principal";
import { createAsyncThunk } from "@reduxjs/toolkit";

const getUserIcrc7Tokens = createAsyncThunk<
  { tokenId: string; arweaveId: string }[], // structure
  Principal,
  { rejectValue: string }
>("emporium/getUserIcrc7Tokens", async (userPrincipal, { rejectWithValue }) => {
  try {
    const actorIcrc7 = await getIcrc7Actor();
    const result = await actorIcrc7.icrc7_tokens_of(
      {
        owner: userPrincipal,
        subaccount: [],
      },
      [],
      []
    );
    console.log("Raw result:", result);

    const tokens = Array.isArray(result)
    ? result.map((value) => {
        console.log("The value is", value);
        console.log("Arware id is", natToArweaveId(value));
  
        return {
          tokenId: value.toString(),
          arweaveId: natToArweaveId(value),
        };
      })
    : [];
  

    return tokens;
  } catch (error) {
    console.error("Error fetching ICRC7 tokens:", error);
    return rejectWithValue("An unknown error occurred while fetching ICRC7 tokens");
  }
});

export default getUserIcrc7Tokens;
