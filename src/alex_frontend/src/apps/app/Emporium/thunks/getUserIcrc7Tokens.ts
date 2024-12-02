import { getIcrc7Actor } from "@/features/auth/utils/authUtils";
import { Principal } from "@dfinity/principal";
import { createAsyncThunk } from "@reduxjs/toolkit";

const getUserIcrc7Tokens = createAsyncThunk<
  string[],
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
      ? result.map((value) => value.toString())
      : [];
    return tokens;
  } catch (error) {
    return rejectWithValue("An unknown error occurred while burning LBRY");
  }
});

export default getUserIcrc7Tokens;
