import { User } from "../../../../../../src/declarations/user/user.did";
import { SerializedUser } from "../authSlice";
import { convertTimestamp } from "@/utils/general";

// Helper function to transform IC user to our state format
export const serializeUser = (icUser: User): SerializedUser => ({
    ...icUser,
    principal: icUser.principal.toString(),
    created_at: convertTimestamp(icUser.created_at),
    updated_at: convertTimestamp(icUser.updated_at),
});