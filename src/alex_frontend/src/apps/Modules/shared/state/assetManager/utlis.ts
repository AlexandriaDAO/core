import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../../../../../declarations/asset_manager/asset_manager.did";

export const getAssetCanister = async (principal: string, actor: ActorSubclass<_SERVICE>): Promise<string | null> => {
    try {
      const result =await  actor.get_all_user_asset_canisters();
      console.log("get_all_user_asset_canisters result", result);
  
      const matchingCanister = result
        .map(([userPrincipal, canisterRegistry]) => {
          if (canisterRegistry.owner.toString() === principal) {
            return canisterRegistry.assigned_canister_id.toString();
          }
          return null;
        })
        .find((canisterId) => canisterId !== null); // Get the first non-null value
  
      return matchingCanister || null;
    } catch (error) {
      console.error("Error fetching asset canister:", error);
      return null;
    }
  };
  