import React, { useState, useEffect } from "react";
import { Principal } from "@dfinity/principal";
import { icrc7 } from "../../../../../declarations/icrc7";
import { natToArweaveId } from "@/utils/id_convert";
import { RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import { updateTransactions, appendTransactions } from "../contentDisplay/redux/contentDisplayThunks";

const popularPrincipals = [
  "7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe",
  "iptxv-t4s22-c4wqj-npnvl-reyuz-holr7-kxjnr-fkllw-yxxhy-s6yjf-wae",
];

export default function NftOwnerSelector() {
  const userPrincipal = useSelector((state: RootState) => state.auth.user);
  const selectedArweaveIds = useSelector((state: RootState) => state.library.selectedArweaveIds);
  const [inputPrincipal, setInputPrincipal] = useState("");
  const [selectedPrincipals, setSelectedPrincipals] = useState<string[]>([]);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (selectedArweaveIds.length === 0) {
      setSelectedPrincipals([]);
    }
  }, [selectedArweaveIds]);

  const handleFetchArweaveIds = async (principalId: string) => {
    try {
      const principal = Principal.fromText(principalId);
      const nftIds = await icrc7.icrc7_tokens_of(
        { owner: principal, subaccount: [] },
        [],
        [BigInt(10)]
      );
      const arweaveIds = nftIds.map(natToArweaveId);
      
      if (selectedPrincipals.includes(principalId)) {
        // Remove the principal and its associated Arweave IDs
        const updatedPrincipals = selectedPrincipals.filter(p => p !== principalId);
        setSelectedPrincipals(updatedPrincipals);
        const updatedArweaveIds = selectedArweaveIds.filter((id: string) => !arweaveIds.includes(id));
        dispatch(updateTransactions(updatedArweaveIds));
      } else {
        // Add the principal and its associated Arweave IDs
        setSelectedPrincipals([...selectedPrincipals, principalId]);
        console.log("Appending transactions: ", arweaveIds);
        dispatch(appendTransactions(arweaveIds));
      }
      
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

  const renderSelectedPrincipals = () => {
    return selectedPrincipals.map((principal) => (
      <span
        key={principal}
        onClick={() => handleFetchArweaveIds(principal)}
        className="px-3 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-300 cursor-pointer mr-2 mb-2 inline-block"
      >
        {principal.slice(0, 5)}...{principal.slice(-5)} ×
      </span>
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center space-x-2">
        <div className="flex-grow flex flex-wrap items-center border border-gray-300 rounded-md p-2">
          {renderSelectedPrincipals()}
          <input
            type="text"
            value={inputPrincipal}
            onChange={(e) => setInputPrincipal(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Enter principal ID"
            className="flex-grow px-3 py-2 focus:outline-none"
          />
        </div>
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
            className={`px-3 py-1 ${
              selectedPrincipals.includes(userPrincipal) ? 'bg-green-600' : 'bg-green-500'
            } text-white rounded-full hover:bg-green-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50`}
          >
            My Library
          </button>
        )}
        {popularPrincipals.map((principal) => (
          <button
            key={principal}
            onClick={() => handleFetchArweaveIds(principal)}
            className={`px-3 py-1 ${
              selectedPrincipals.includes(principal) ? 'bg-gray-400' : 'bg-gray-200'
            } text-gray-700 rounded-full hover:bg-gray-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50`}
          >
            {principal.slice(0, 5)}...{principal.slice(-5)}
          </button>
        ))}
      </div>
    </div>
  );
}
