import { Engine } from "../../../../../../src/declarations/user/user.did";
import { convertTimestamp } from "@/utils/general";
import { SerializedEngine } from "../myEnginesSlice";

// Helper function to transform IC user to our state format
export const serializeEngine = (icEngine: Engine): SerializedEngine => ({
    ...icEngine,
    id: icEngine.id.toString(),
    owner: icEngine.owner.toString(),
    created_at: convertTimestamp(icEngine.created_at),
    updated_at: convertTimestamp(icEngine.updated_at)
});