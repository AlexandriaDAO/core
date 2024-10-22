import React, { useState, useEffect } from "react";
import { Principal } from "@dfinity/principal";
import { icrc7 } from "../../../../../../../declarations/icrc7";
import { natToArweaveId } from "@/utils/id_convert";
import { RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { setSearchState } from "../../redux/arweaveSlice";
import { AppDispatch } from "@/store";

const popularPrincipals = [
  "7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe",
  "iptxv-t4s22-c4wqj-npnvl-reyuz-holr7-kxjnr-fkllw-yxxhy-s6yjf-wae",
];

export default function NftOwnerSelector() {
  const userPrincipal = useSelector((state: RootState) => state.auth.user);
  const [selectedPrincipals, setSelectedPrincipals] = useState<string[]>([]);
  const [inputPrincipal, setInputPrincipal] = useState("");
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (selectedPrincipals.length > 0) {
      fetchNfts(selectedPrincipals);
    } else {
      dispatch(setSearchState({ transactions: [] }));
    }
  }, [selectedPrincipals]);

  const fetchNfts = async (principals: string[]) => {
    try {
      const allTokenIds = await Promise.all(
        principals.map(async (principal) => {
          const tokenIds = await icrc7.icrc7_tokens_of(
            { owner: Principal.fromText(principal), subaccount: [] },
            [],
            []
          );
          return tokenIds.map(natToArweaveId);
        })
      );
      const uniqueTokenIds = Array.from(new Set(allTokenIds.flat()));
      dispatch(setSearchState({ transactions: uniqueTokenIds }));
      console.log("Fetched NFTs:", uniqueTokenIds);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    }
  };

  const addPrincipal = (principal: string) => {
    if (!selectedPrincipals.includes(principal)) {
      setSelectedPrincipals([...selectedPrincipals, principal]);
    }
  };

  const removePrincipal = (principal: string) => {
    setSelectedPrincipals(selectedPrincipals.filter((p) => p !== principal));
  };

  const toggleUserPrincipal = () => {
    if (userPrincipal) {
      if (selectedPrincipals.includes(userPrincipal)) {
        removePrincipal(userPrincipal);
      } else {
        addPrincipal(userPrincipal);
      }
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputPrincipal) {
      addPrincipal(inputPrincipal);
      setInputPrincipal("");
    }
  };

  const renderPrincipalTag = (principal: string) => (
    <span key={principal} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
      {principal === userPrincipal ? "My Library" : `${principal.slice(0, 5)}...${principal.slice(-5)}`}
      <button onClick={() => removePrincipal(principal)} className="ml-2 text-blue-600 hover:text-blue-800">
        &times;
      </button>
    </span>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {selectedPrincipals.map(renderPrincipalTag)}
      </div>
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
          onClick={() => inputPrincipal && addPrincipal(inputPrincipal)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {userPrincipal && (
          <button
            onClick={toggleUserPrincipal}
            className={`px-3 py-1 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
              selectedPrincipals.includes(userPrincipal)
                ? "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                : "bg-green-500 text-white hover:bg-green-600 focus:ring-green-500"
            }`}
          >
            My Library
          </button>
        )}
        {popularPrincipals.map((principal) => (
          <button
            key={principal}
            onClick={() => addPrincipal(principal)}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
          >
            {principal.slice(0, 5)}...{principal.slice(-5)}
          </button>
        ))}
      </div>
    </div>
  );
}
