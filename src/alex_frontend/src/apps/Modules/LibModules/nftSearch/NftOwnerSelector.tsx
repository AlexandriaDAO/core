import React, { useState, useEffect } from "react";
import { RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import { setSelectedPrincipals } from "../../shared/state/nft/librarySlice";
import { togglePrincipalSelection } from '../../shared/state/nft/libraryThunks';

const popularPrincipals = [
  "7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe",
  "iptxv-t4s22-c4wqj-npnvl-reyuz-holr7-kxjnr-fkllw-yxxhy-s6yjf-wae",
];

export default function NftOwnerSelector() {
  const userPrincipal = useSelector((state: RootState) => state.auth.user);
  const selectedArweaveIds = useSelector((state: RootState) => state.library.selectedArweaveIds);
  const selectedPrincipals = useSelector((state: RootState) => state.library.selectedPrincipals);
  const [inputPrincipal, setInputPrincipal] = useState("");
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (selectedArweaveIds.length === 0) {
      dispatch(setSelectedPrincipals([]));
    }
  }, [selectedArweaveIds, dispatch]);

  const handleFetchArweaveIds = async (principalId: string) => {
    try {
      await dispatch(togglePrincipalSelection(principalId));
      setInputPrincipal("");
    } catch (error) {
      console.error("Error fetching Arweave IDs:", error);
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
      {/* Debug display */}
      <div className="text-sm text-gray-500 mb-2">
        Selected Principals: {selectedPrincipals.length}
        {selectedPrincipals.map(p => (
          <div key={p} className="text-xs">
            {p}
          </div>
        ))}
      </div>

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
