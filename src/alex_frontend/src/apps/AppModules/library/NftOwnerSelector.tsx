import React, { useState } from "react";
import { Principal } from "@dfinity/principal";
import { icrc7 } from "../../../../../declarations/icrc7";
import { natToArweaveId } from "@/utils/id_convert";
import { RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import { setSelectedArweaveIds } from "./redux/librarySlice";

const popularPrincipals = [
  "7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe",
  "iptxv-t4s22-c4wqj-npnvl-reyuz-holr7-kxjnr-fkllw-yxxhy-s6yjf-wae",
];

export default function NftOwnerSelector() {
  const userPrincipal = useSelector((state: RootState) => state.auth.user);
  const [inputPrincipal, setInputPrincipal] = useState("");
  const dispatch = useDispatch<AppDispatch>();

  const handleFetchArweaveIds = async (principalId: string) => {
    try {
      const principal = Principal.fromText(principalId);
      const nftIds = await icrc7.icrc7_tokens_of(
        { owner: principal, subaccount: [] },
        [],
        []
      );
      const arweaveIds = nftIds.map(natToArweaveId);
      dispatch(setSelectedArweaveIds(arweaveIds));
      setInputPrincipal("");
    } catch (error) {
      console.error("Error fetching Arweave IDs:", error);
      // You might want to add some error handling UI here
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputPrincipal) {
      handleFetchArweaveIds(inputPrincipal);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={inputPrincipal}
          onChange={(e) => setInputPrincipal(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Enter principal ID"
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => inputPrincipal && handleFetchArweaveIds(inputPrincipal)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Fetch NFTs
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {userPrincipal && (
          <button
            onClick={() => handleFetchArweaveIds(userPrincipal)}
            className="px-3 py-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            My Library
          </button>
        )}
        {popularPrincipals.map((principal) => (
          <button
            key={principal}
            onClick={() => handleFetchArweaveIds(principal)}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
          >
            {principal.slice(0, 5)}...{principal.slice(-5)}
          </button>
        ))}
      </div>
    </div>
  );
}
