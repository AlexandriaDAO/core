
const getUserLogs = createAsyncThunk<
  TransformedLog[],
  {
    page?: number;
    searchStr?: string;
    pageSize?: string;
  },
  { rejectValue: string }
>(
  "emporium/getUserLogs",
  async (
    { page = 1, searchStr = "", pageSize = "100" },
    { rejectWithValue }
  ) => {})