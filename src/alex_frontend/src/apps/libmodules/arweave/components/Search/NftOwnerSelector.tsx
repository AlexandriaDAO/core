import React, { useState } from "react";
import { Principal } from "@dfinity/principal";
import { icrc7 } from "../../../../../../../declarations/icrc7";
import { natToArweaveId } from "@/utils/id_convert";
import { RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { setSearchState } from "../../redux/arweaveSlice";
import { AppDispatch } from "@/store";

export default function NftOwnerSelector() {
  const principal = useSelector((state: RootState) => state.auth.user);
  const [showPrincipal, setShowPrincipal] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const fetchUserNfts = async () => {
    if (principal) {
      try {
        const tokenIds = await icrc7.icrc7_tokens_of(
          { owner: Principal.fromText(principal), subaccount: [] },
          [],
          []
        );
        const arweaveIds = tokenIds.map(natToArweaveId);
        
        // Dispatch the action to update the search state with the user's NFT IDs
        dispatch(setSearchState({ transactions: arweaveIds }));
        console.log("Fetched user NFTs:", arweaveIds);
        
        setShowPrincipal(true);
      } catch (error) {
        console.error("Error fetching user NFTs:", error);
      }
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <button 
        onClick={fetchUserNfts}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        My NFTs
      </button>
      {showPrincipal && principal && (
        <span className="text-sm text-gray-600">
          Principal: {principal}
        </span>
      )}
    </div>
  );
}
