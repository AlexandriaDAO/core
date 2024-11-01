import React, { useEffect } from "react";
import { RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import { togglePrincipalSelection } from '../../shared/state/nft/libraryThunks';
import { loadContentForTransactions } from "../../shared/state/content/contentDisplayThunks";
import { wipe } from "../../shared/state/wiper";
import { toggleSortDirection } from "../../shared/state/nft/librarySlice";

const popularPrincipals = [
  "7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe",
  "iptxv-t4s22-c4wqj-npnvl-reyuz-holr7-kxjnr-fkllw-yxxhy-s6yjf-wae",
];

export default function NftOwnerSelector() {
  const userPrincipal = useSelector((state: RootState) => state.auth.user);
  const selectedPrincipals = useSelector((state: RootState) => state.library.selectedPrincipals);
  const transactions = useSelector((state: RootState) => state.contentDisplay.transactions);
  const sortAsc = useSelector((state: RootState) => state.library.sortAsc);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(wipe());
  }, [selectedPrincipals]);

  const handleFetchArweaveIds = async (principalId: string) => {
    try {
      await dispatch(togglePrincipalSelection(principalId));
    } catch (error) {
      console.error("Error fetching Arweave IDs:", error);
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
        <button
          onClick={() => dispatch(loadContentForTransactions(transactions))}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Show NFTs
        </button>
        <button
          onClick={() => {
            dispatch(toggleSortDirection());
            dispatch(loadContentForTransactions(transactions));
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        >
          Sort {sortAsc ? "↑" : "↓"}
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
        <div className="flex-grow flex flex-wrap items-center border border-gray-300 rounded-md p-2">
          {renderSelectedPrincipals()}
        </div>
      </div>
    </div>
  );
}
