import { getActorAssetManager } from "@/features/auth/utils/authUtils";

export const getAssetCanister = async (principal: string): Promise<string | null> => {
    try {
      const actor =await  getActorAssetManager();
      const result =await  actor.get_all_user_asset_canisters();
  
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
  