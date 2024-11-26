import { Node } from "../../../../../../src/declarations/user/user.did";
import { convertTimestamp } from "@/utils/general";
import { SerializedNode } from "../myNodesSlice";

// Helper function to transform IC user to our state format
export const serializeNode = (icNode: Node): SerializedNode => ({
    ...icNode,
    id: icNode.id.toString(),
    owner: icNode.owner.toString(),
    created_at: convertTimestamp(icNode.created_at),
    updated_at: convertTimestamp(icNode.updated_at)
});